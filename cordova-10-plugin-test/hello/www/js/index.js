/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
console.log('$ javascript testing.....')
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log(`$ onDeviceReady`);
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById("getFromJavaBtn").onclick = ()=>{
        const start = new Date();
        console.log(`$ onclick #getFromJavaBtn`)
        const fiboInput = document.getElementById('fibo-input').value;
        console.log(`$ fiboInput ${fiboInput}`)
        window.plugins.fibo.get(fiboInput,function onSuccess(value){
            const duration = new  Date().getTime()-start.getTime();
            document.getElementById('duration').textContent =  `duration ${duration} ms`;
            console.log(`$ window.plugins.fibo.get(${fiboInput}) onSuccess value`,value);
            document.getElementById('fibo-java-result').textContent = `${value}`;
        },function onFailed(err){
            console.error(`$ err`,err)
        });
    }

    document.getElementById("getFromJsBtn").onclick = ()=>{
        console.log(`$ onclick #getFromJsBtn`)
        const fiboInput = document.getElementById('fibo-input').value;
        console.log(`$ fiboInput ${fiboInput}`)
        const start = new Date();
        const value = fibo(parseInt(fiboInput));
        const duration = new  Date().getTime()-start.getTime();
        document.getElementById('duration').textContent =  `duration ${duration} ms`;
        document.getElementById('fibo-js-result').textContent = `${value}`;

        function fibo(n){
            if(n<=1){
                return n;
            }
            return fibo(n-1)+fibo(n-2);
        }
    }
}