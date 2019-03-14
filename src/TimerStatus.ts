import { StatusBarItem, window, StatusBarAlignment, workspace, ProgressLocation } from "vscode";
import PairConfig from "./PairConfig";
export default class TimerStatus {
  timerStatus: StatusBarItem;
  interval: any;
  time: number;
  pairConfigs: PairConfig[];
  currentPairIndex: number;

  constructor(commandId: string, alignment: number, pairConfigs: PairConfig[]) {
    this.timerStatus = window.createStatusBarItem(
      StatusBarAlignment.Right,
      alignment
    );
    this.pairConfigs = pairConfigs;
    this.timerStatus.command = commandId;
    this.timerStatus.text = "Happy Pairing!";
    this.timerStatus.color = "#fff";

    this.time = workspace
    .getConfiguration("pairodoro")
    .get("seconds") as number;

    this.currentPairIndex = 0;

    this.interval = setInterval(() => {
      this.updateTimerValue();
    }, 1000);

  }

  show() {
    this.pairConfigs[this.currentPairIndex].show();
    this.timerStatus.show();
  }

  updateTimerValue() {
    if (this.time === 0) {
     this.time  = workspace
     .getConfiguration("pairodoro")
     .get("seconds") as number;     
     this.displayNextPair();
    }

    if(this.time === 5) {
        this.notifyPairSwap();
    }

    this.timerStatus.text = `${Math.floor(this.time / 60)}`.padStart(2, '0') + ':' + `${this.time % 60}`.padStart(2, '0');
    this.time--;
  }

  clearTimer() {
    clearInterval(this.interval);
}

    private notifyPairSwap() {
        window.withProgress({
            location: ProgressLocation.Notification,
            title: `It's almost ${this.getNextPair().getName()}'s turn to type!`,
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => { });
            progress.report({ increment: 20 });
            const interval = setInterval(() => {
                progress.report({ increment: 20 });
            }, 1000);
            var promise = new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                    clearInterval(interval);
                }, 5000);
            });
            return promise;
        });
    }

    private displayNextPair() {
        this.pairConfigs[this.currentPairIndex].hide();
        this.currentPairIndex = (this.currentPairIndex + 1) % this.pairConfigs.length;
        this.pairConfigs[this.currentPairIndex].show();
    }

    private getNextPair(): PairConfig {
      return this.pairConfigs[(this.currentPairIndex + 1) % this.pairConfigs.length];
    }

}
