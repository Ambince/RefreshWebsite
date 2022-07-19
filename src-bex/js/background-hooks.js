// Hooks added here have a bridge allowing communication between the BEX Background Script and the BEX Content Script.
// Note: Events sent from this background script using `bridge.send` can be `listen`'d for by all client BEX bridges for this BEX

// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/background-hooks
/**
 * task:
 *  interval:执行器
 *  taskId
 * @type {*[]}
 */

let allRefreshTasks = new Map();


export default function attachBackgroundHooks(bridge, allActiveConnections) {


  bridge.on('storage.get', event => {
    chrome.storage.local.get('REFRESH_KEY', existData => {
      let localData = existData.REFRESH_KEY;
      bridge.send(event.eventResponseKey, localData)
    })
  })

  /**
   * 存储数据
   */
  bridge.on('storage.set', event => {
    const payload = event.data.payload
    chrome.storage.local.get([payload.key], existData => {
      let localData = existData.REFRESH_KEY;
      if (localData) {
        localData = localData.filter((item, index, arr) => {
          return item.website != payload.data.website;
        });
        localData.push(payload.data);
        chrome.storage.local.set({ [payload.key]: localData }, () => {
          bridge.send(event.eventResponseKey, payload)
        })
        addRefreshTask(payload.data.website, payload.data);
      } else {
        // 如果存在就更新，没有的话就add
        const dataArray = [];
        dataArray.push(payload.data);
        chrome.storage.local.set({ [payload.key]: dataArray }, () => {
          bridge.send(event.eventResponseKey, payload)
        })
        addRefreshTask(payload.data.website, payload.data);
      }

    })

  })


  bridge.on('storage.clear', event => {
    console.log('Amence 清除', allRefreshTasks)

    for (let taskList of allRefreshTasks.values()) {
      for (let task of taskList) {
        window.clearInterval(task.interval);
      }
    }

    allRefreshTasks.clear();

    chrome.storage.local.clear(function () {
      chrome.storage.local.get('REFRESH_KEY', existData => {
        let localData = existData.REFRESH_KEY;
        bridge.send(event.eventResponseKey, localData)
      })
    });

  })

  // Send a message to the client based on something happening.
  chrome.tabs.onCreated.addListener(tab => {
    console.log('Amence onCreated addListener', tab)
    bridge.send('browserTabCreated', { tab })
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      bridge.send('browserTabUpdated', { tab, changeInfo })
    }
  })


  /**
   * 浏览器输入url变化
   */
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(tabId, tab.id, tab.url);
    addNewTabToTask(tab.url, tabId);
  })


  function addNewTabToTask(url, tabId) {
    if (!url || url == 'chrome://newtab/') return;
    console.log("addNewTabToTask", url, tabId);
    chrome.storage.local.get('REFRESH_KEY', existData => {
      const localData = existData.REFRESH_KEY;
      for (let taskInfo of localData) {
        if (taskInfo.website == url) {
          var handle = window.setInterval(function () {
            chrome.tabs.reload(tabId, null, null);
          }, Number(taskInfo.time) * 1000);

          let websiteTasks = allRefreshTasks.get(taskInfo.website + taskInfo.time);
          if (!websiteTasks) {
            websiteTasks = new Array();
            allRefreshTasks.set(taskInfo.website + taskInfo.time, websiteTasks);
          }
          websiteTasks.push({ interval: handle, tabId });
        }
      }
    })
  }

  /**
   * 1.url 变化触发
   * 2.任务数据改变触发
   */
  function addRefreshTask(url, taskInfo) {
    chrome.tabs.query({}, function (tabs) {
      for (const result of tabs) {
        if (result.url == url) {
          var handle = window.setInterval(function () {
            chrome.tabs.reload(result.id, null, null);
          }, Number(taskInfo.time) * 1000);

          let websiteTasks = allRefreshTasks.get(taskInfo.website + taskInfo.time);
          if (!websiteTasks) {
            websiteTasks = new Array();
            allRefreshTasks.set(taskInfo.website + taskInfo.time, websiteTasks);
          }
          websiteTasks.push({ interval: handle, tabId: result.id });
        }
      }
    });
  }


  function removeRefreshTask(taskId) {
    const taskList = allRefreshTasks.get(taskId);
    if (taskList) {
      for (let task of taskList) {
        window.clearInterval(task.interval);
      }
      allRefreshTasks.delete(taskId);
    }
  }


}
