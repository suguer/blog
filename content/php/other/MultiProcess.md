---
title: "MultiProcess"
date: 2021-10-31T10:08:33+08:00
weight: 2
---

MultiProcessTrait.php

```php
trait MultiProcessTrait
{

    protected $processes = [];

    protected $maxFork = 14;


    /**
     * @param $action \Closure
     * @param array $params
     */
    public function fork($action, $params = [])
    {
        $this->processes[] = [
            "action" => $action,
            "params" => $params
        ];
    }

    protected $runningProcess = [];

    public function waitProcessRun()
    {
        while (count($this->runningProcess) > 0) {
            $mypid = pcntl_waitpid(-1, $status, WNOHANG);
            foreach ($this->runningProcess as $key => $pid) {
                if ($mypid == $pid || $mypid == -1) {
                    echo "child $key completed\n";
                    unset($this->runningProcess[$key]);
                    //判断是否还有未fork进程
                    $this->runOne();
                }
            }
        }
    }

    public function runOne()
    {
        $process = array_shift($this->processes);
        if ($process) {
            $pid = pcntl_fork();
            if ($pid == -1) {
                die("could not fork");
            } elseif ($pid) {
                $this->runningProcess[$pid] = $pid;
                echo "create child: $pid \n";
            } else {
                //执行子进程
                call_user_func_array($process['action'], $process['params']);
                exit;// 一定要注意退出子进程,否则pcntl_fork() 会被子进程再fork,带来处理上的影响。
            }
        }
    }

    public function runProcess()
    {
        if (empty($this->processes)) {
            return;
        }

        for ($i = 0; $i < $this->maxFork; $i++) {
            $this->runOne();
        }

        $this->waitProcessRun();

    }

}

```