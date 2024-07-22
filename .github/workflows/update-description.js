import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';

const PREVIEW_HEADER= '\n## 🎥 Previews'

try {
  const token = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });

  const { owner, repo } = github.context.repo;
  const pr_number = github.context.payload.pull_request?.number ?? github.context.runNumber;

  // Get the current pull request description
  const { data: currentPR } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pr_number,
  });

	/** @type string */
  const currentDescription = currentPR.body;
	// Update Preview section
	const c= currentDescription.indexOf(PREVIEW_HEADER);
	const baseURL= `https://deploy-preview-${ pr_number }--qci-preview.netlify.app`;
	if(c>-1){
		const start= c + PREVIEW_HEADER.length
		const end= currentDescription.indexOf('\n##', start);
		const previewUrls= (end===-1 ? currentDescription.slice(start) : currentDescription.slice(start, end)).split('\n').map(line=> {
			const line2=line.trim();
			if(line2.startsWith('-')){
				try {
					return `- ${new URL(line2.slice(1).trim(), baseURL).href}`
				} catch (error) {
					console.error('PR ERROR>>', error);
				}
			}
			return line2;
		}).join('\n');
		const newDescription= `${currentDescription.slice(0, start)}${previewUrls}${end===-1?'':currentDescription.slice(end+1)}`;
		if(newDescription!==currentDescription)
			await octokit.pulls.update({
				owner,
				repo,
				pull_number: pr_number,
				body: newDescription,
			});
	}
} catch (error) {
  core.setFailed(error.message);
}
