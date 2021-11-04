---
title: "Gitfun"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

用于git角色登录服务器,触发版本pull和同步
/home/git/gitfun.inc.sh
```sh
#!/bin/sh
/bin/stty intr ''
function git_checkout()
{
if [ -d $checkout_path/.git ];then
        cd $checkout_path
        git pull $git_url
        #git pull $git_url $branch    #checkout a branch
	chmod 700 $checkout_path/.git
        echo $git_url update finish!
else
        mkdir -p $checkout_path
        if [ ! -d $checkout_path ];then
                exit
        fi
        cd $checkout_path/../
        git clone $git_url
        #git checkout $branch   #switch to branch
	chmod 700 $checkout_path/.git
        if [ -d $checkout_path/.git ];then
        echo $git_url has checkout successfully!
        fi
fi
}
function git_checkout_branch()
{
if [ -d $checkout_path/.git ];then
        cd $checkout_path
        #git pull $git_url
        git pull $git_url $branch    #checkout a branch
	chmod 700 $checkout_path/.git
        echo $git_url update finish!
else
        mkdir -p $checkout_path
        if [ ! -d $checkout_path ];then
                exit
        fi
        cd $checkout_path/../
        git clone $git_url $checkout_path
	chmod 700 $checkout_path/.git
        cd $checkout_path
        git checkout $branch   #switch to branch
        if [ -d $checkout_path/.git ];then
        echo $git_url has checkout successfully!
        fi
fi
}

```


/home/git/.bashrc
```base
echo passwd
echo project

while read -p "input the repository name[input 'end' to exit] ?" repos
do
#########start
if [ "$repos" = "passwd" ];then
/usr/bin/passwd
continue


elif [ "$repos" = "project" ];then
branch=released
git_url="url.git"
checkout_path=/home/git/$repos
git_checkout_branch
cd /home/git/$repos
echo "build ok"
rsync -avu --delete --exclude ".git"  /home/git/$repos/  /targetpath
continue

elif [ "$repos" = "end" ];then
break
else
echo "no such repository"
fi
done
exit
```