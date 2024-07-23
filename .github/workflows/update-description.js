import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';

const PREVIEW_HEADER= '\n## 🎥 Previews'
const LOADING_MSG= '\n🔥 Creating Preview... please wait (approximately 5min)'

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
	const currentDescription = currentPR.body.replace(LOADING_MSG, '');
	// Update Preview section
	const newDescription= process.env.DESC_STATE==='loading' ? currentDescription+LOADING_MSG :  appendPreviewLinks(currentDescription, pr_number);
	// Replace description
	if(newDescription!==currentDescription)
		await octokit.pulls.update({
			owner,
			repo,
			pull_number: pr_number,
			body: newDescription,
		});
} catch (error) {
  core.setFailed(error.message);
}

function appendPreviewLinks(currentDescription, pr_number){
	const c= currentDescription.indexOf(PREVIEW_HEADER);
	const defaultPreviewURLs= process.env.PREVIEW_URLS?.split(',') ?? [];
	const baseURL= `https://data-preview-${ pr_number }--qci-preview.netlify.app`;
	// Edit URLs
	if(c===-1){
		return `${currentDescription}${PREVIEW_HEADER}\n${(previewURLs.length>0? previewURLs : ['/']).map(path=> `- ${new URL(path, baseURL).href}`).join('\n')}`
	} else {
		const start= c + PREVIEW_HEADER.length
		const end= currentDescription.indexOf('\n##', start);
		const previewUrls= (end===-1 ? currentDescription.slice(start) : currentDescription.slice(start, end)).split('\n').map(line=> {
			const line2=line.trim();
			if(line2.startsWith('-')){
				try {
					return new URL(line2.slice(1).trim(), baseURL).pathname
				} catch (error) {
					console.error('PR ERROR>>', error);
				}
			}
			return line2;
		}).join('\n');
		// Add missing paths
		defaultPreviewURLs.forEach(path=> {
			if(!previewUrls.include(path))
				previewUrls.push(path)
		});
		if(previewUrls.length===0)
			previewUrls.push('/')
		return `${
			currentDescription.slice(0, start)
		}${
			previewUrls.map(path => `- ${new URL(path, baseURL).href}`).join('\n')
		}${end===-1?'':currentDescription.slice(end+1)}`;
		
	}
}