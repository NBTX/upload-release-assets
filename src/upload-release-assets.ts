import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

import * as fs from 'fs';
import * as path from 'path';

import * as callbackGlob from 'glob';
import * as mimeTypes from 'mime-types';

/**
 * 'Promisified' version of the glob function.
 * @param pattern
 * @param options
 */
async function glob(pattern: string, options?: callbackGlob.IOptions) : Promise<string[]> {
  return await new Promise((resolve, reject) => {
    return callbackGlob(pattern, options, (err, files) => {
      if (err) return reject(err);
      else {
        if (files == null || files.length == 0) throw new Error("No files found.");
        else return resolve(files);
      }
    });
  });
}

/**
 * Upload a file to the specific GitHub Release URL.
 *
 * @param github - The Octokit instance to use for authenticating the upload.
 * @param uploadUrl - The release's upload URL.
 * @param assetPath - The local filesystem path to the asset to upload.
 */
async function uploadFile(github: Octokit, uploadUrl: string, assetPath: string) {
  
  const assetName: string = path.basename(assetPath);
  
  // Determine content-length for header to upload asset
  const contentLength = filePath => fs.statSync(filePath).size;
  
  // Guess mime type using mime-types package - or fallback to application/octet-stream
  const assetContentType = mimeTypes.lookup(assetName) || 'application/octet-stream';
  
  // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
  const headers = { 'content-type': assetContentType, 'content-length': contentLength(assetPath) };
  
  // Upload a release asset
  // API Documentation: https://developer.github.com/v3/repos/releases/#upload-a-release-asset
  // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
  // @ts-ignore
  await github.repos.uploadReleaseAsset({
    url: uploadUrl,
    headers,
    name: assetName,
    data: fs.readFileSync(assetPath) as unknown as string
  });
  
}

export async function run() {
  try {
    
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const uploadUrl = core.getInput('upload_url', { required: true });
    const targets = core.getInput('targets', { required: true });

    let files = await glob(targets);
    console.log("Uploading files: " + JSON.stringify(files));
    
    await Promise.all(files.map((file) => {
      console.log("Uploading " + file + "...");
      return uploadFile(github, uploadUrl, file);
    }));

  } catch (error) {
    core.setFailed(error.message);
  }
}