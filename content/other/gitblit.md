---
title: "Gitblit"
date: 2022-05-30T10:08:33+08:00
---
##### gitblit通过post-receive 配置可以实现简单的自动化部署或推送  
![步骤1](/images/content/other/20220530_001.jpg)  
如append-auto-compile实现如下:    
1. 创建 append-auto-compile.groovy  
    
```
  import com.gitblit.GitBlit
  import com.gitblit.Keys
  import com.gitblit.models.RepositoryModel
  import com.gitblit.models.TeamModel
  import com.gitblit.models.UserModel
  import com.gitblit.utils.JGitUtils
  import com.gitblit.utils.StringUtils
  import java.text.SimpleDateFormat
  import org.eclipse.jgit.api.CloneCommand
  import org.eclipse.jgit.api.PullCommand
  import org.eclipse.jgit.api.Git
  import org.eclipse.jgit.lib.Repository
  import org.eclipse.jgit.lib.Config
  import org.eclipse.jgit.revwalk.RevCommit
  import org.eclipse.jgit.transport.ReceiveCommand
  import org.eclipse.jgit.transport.ReceiveCommand.Result
  import org.eclipse.jgit.util.FileUtils
  import org.slf4j.Logger


logger.info("append-auto-compile hook triggered by ${user.username} for ${repository.name} l")

def rootFolder = '/home/git/'
def bare = false
def cloneAllBranches = true
def cloneBranch = 'refs/heads/master'
def includeSubmodules = true

def repoName = repository.name
def destinationFolder = new File(rootFolder, StringUtils.stripDotGit(repoName))
def srcUrl = 'file://' + new File(gitblit.getRepositoriesFolder(), repoName).absolutePath

Runtime r = Runtime.getRuntime();
for (ReceiveCommand command : commands) {
    if(command.refName=="refs/heads/released"){
        r.exec("/bin/sh /home/gitblit/gitblit_data/scriptsFolder/gitcompile.sh ${destinationFolder} ${repoName}");
        logger.info("compile ${srcUrl} Folder=${destinationFolder} repoName= ${repoName} ");
    }
}

```  
    
2.  创建 gitcompile.sh
```shell
cd $1
#/usr/local/git/bin/git pull
#sh $1.sh
#/usr/local/git/bin/git pull >>/tmp/$2.log 2>&1
sh $1_compile.sh >>/tmp/$2.compile.log 2>&1
```

3. 创建仓库名+compile.sh 如 git_name_compile.sh  
    我在自动化部署上主要执行了自动编译和钉钉推送,git上传等操作
```shell

time3=$(date "+%Y-%m-%d %H:%M:%S")
curl --location --request POST 'https://oapi.dingtalk.com/robot/send?access_token=钉钉的access_token' \
--header 'Content-Type: application/json' \
--data "{
   \"msgtype\": \"text\",
    \"text\": {
        \"content\": \"[${time3}]正在编译中\"
    }
  }"


cd /home/git/项目目录
cnpm run build


cd /home/git/compile/另一个项目目录
time3=$(date "+%Y-%m-%d %H:%M:%S")
git pull
/usr/bin/rsync -avu --delete --exclude ".git"  /home/git/项目目录/dist/ /home/git/compile/另一个项目目录
git add .
git commit -m "${time3}"
git push

curl --location --request POST 'https://oapi.dingtalk.com/robot/send?access_token=钉钉的access_token' \
--header 'Content-Type: application/json' \
--data "{
   \"msgtype\": \"text\",
    \"text\": {
        \"content\": \"[${time3}]编译完毕\"
    }
  }"
~                                                                                                                                                                                                                                                                             
~                       
```