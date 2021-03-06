/*
Copyright 2016-2017 Bowler Hat LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as fs from "fs";
import * as path from "path";
import validateFrameworkSDK from "./validateFrameworkSDK";

const ENVIRONMENT_VARIABLE_PATH = "PATH";

export default function findSDKsInPathEnvironmentVariable(): string[]
{
	let result: string[] = [];

	if(!(ENVIRONMENT_VARIABLE_PATH in process.env))
	{
		return result;
	}
	
	let PATH = <string> process.env.PATH;
	let paths = PATH.split(path.delimiter);
	paths.forEach((currentPath) =>
	{
		//first check if this directory contains the NPM version of FlexJS for Windows
		let mxmlcPath = path.join(currentPath, "mxmlc.cmd");
		if(fs.existsSync(mxmlcPath))
		{
			let sdkPath = path.join(path.dirname(mxmlcPath), "node_modules", "flexjs");
			if(fs.existsSync(sdkPath) && validateFrameworkSDK(sdkPath))
			{
				result.push(sdkPath);
			}
		}
		else
		{
			mxmlcPath = path.join(currentPath, "mxmlc");
			if(fs.existsSync(mxmlcPath))
			{
				//this may a symbolic link rather than the actual file, such as
				//when Apache FlexJS is installed with NPM on macOS, so get the
				//real path.
				mxmlcPath = fs.realpathSync(mxmlcPath);
				//first, check for bin/mxmlc
				let frameworksPath = path.join(path.dirname(mxmlcPath), "..", "frameworks");
				if(fs.existsSync(frameworksPath) && fs.statSync(frameworksPath).isDirectory())
				{
					let sdkPath = path.join(path.dirname(mxmlcPath), "..");
					if(validateFrameworkSDK(sdkPath))
					{
						result.push(sdkPath);
					}
				}
				//then, check for js/bin/mxmlc
				frameworksPath = path.join(path.dirname(mxmlcPath), "..", "..", "frameworks");
				if(fs.existsSync(frameworksPath) && fs.statSync(frameworksPath).isDirectory())
				{
					let sdkPath = path.join(path.dirname(mxmlcPath), "..", "..");
					if(validateFrameworkSDK(sdkPath))
					{
						result.push(sdkPath);
					}
				}
			}
		}
	});
	return result;
}