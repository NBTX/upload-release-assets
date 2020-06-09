const core = require('@actions/core');
const { GitHub } = require('@actions/github');
const fs = require('fs');
const path = require('path');
const $glob = require('glob');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const uploadUrl = core.getInput('upload_url', { required: true });
    const targets = core.getInput('targets', { required: true });

    async function glob(pattern, options) {
      return await new Promise((resolve, reject) => {
        return $glob(pattern, options, (err, files) => {
          if (err) return reject(err);
          else return resolve(files);
        });
      });
    }

    let files = await glob(targets);
    if (files == null) throw new Error("No files found.");

    console.log("Uploading files: " + JSON.stringify(files));

    async function uploadFile(assetPath, assetName) {

      // const assetPath = core.getInput('asset_path', { required: true });
      // const assetName = core.getInput('asset_name', { required: true });
      // const assetContentType = core.getInput('asset_content_type', { required: true });

      // Determine content-length for header to upload asset
      const contentLength = filePath => fs.statSync(filePath).size;

      // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
      const headers = { /*'content-type': assetContentType,*/ 'content-length': contentLength(assetPath) };

      // Upload a release asset
      // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
      await github.repos.uploadReleaseAsset({
        url: uploadUrl,
        headers,
        name: assetName,
        file: fs.readFileSync(assetPath)
      });

    }

    await Promise.all(files.map((file) => {
      console.log("Uploading " + file + "...");
      return uploadFile(file, path.basename(file));
    }));

  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
