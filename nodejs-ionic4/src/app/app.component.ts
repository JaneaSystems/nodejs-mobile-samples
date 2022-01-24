import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.startNodeProject();
    });
  }

  channelListener(msg) {
    console.log('[cordova] received:' + msg);
  }

  startupCallback(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Node.js Mobile Engine Started');
      nodejs.channel.send('Hello from Cordova!');
    }
  };

  startNodeProject() {
    nodejs.channel.setListener(this.channelListener);
    nodejs.start('main.js', this.startupCallback);
    // To disable the stdout/stderr redirection to the Android logcat:
    // nodejs.start('main.js', startupCallback, { redirectOutputToLogcat: false });
  }
}
