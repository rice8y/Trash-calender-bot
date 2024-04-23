const SPREAD_SHEET_URL = 'YOUR_SS_URL';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKE';
const MY_USER_ID = 'YOUR_USER_ID';
const ss = SpreadsheetApp.openByUrl(SPREAD_SHEET_URL);
const sheet = ss.getSheets()[0];

// 一行分のデータを受け取って、シート末尾に記録する
function addRecord(records = [], flag) {
  // ユーザーIDの列を取得
  const userIdColumn = sheet.getRange(2, 2, sheet.getLastRow() - 1).getValues().flat();

  // 新しいユーザーIDと比較して重複をチェック
  if (userIdColumn.includes(records[1])) {
    return;
  }

  // 最終行の一行下に追記
  const lastRow = sheet.getLastRow() + 1;
  const range = sheet.getRange(lastRow, 1, 1, records.length)
  range.setValues([records])

  const lastRowM = sheetM.getLastRow() + 1;
  const rangeM = sheetM.getRange(lastRowM, 1, 1, records.length)
  rangeM.setValues([records])

  sendMessage(MY_USER_ID, "[" + records[0] + "]\n" + records[2] + "が登録されました。");
}

// POSTリクエストに対する処理
function doPost(e) {
  // データが空なら処理しない
  if (e == null || e.postData == null || e.postData.contents == null) return;

  // リクエストを受け取ってオブジェクト化
  const event = JSON.parse(e.postData.contents).events[0];
  // 記録するデータを取得
  const datetime = new Date();
  const userId = event.source.userId;
  const eventType = event.type;
  const nickname = getUserProfile(userId);

  if (eventType == "follow") {
    const records = [datetime, userId, nickname];
    addRecord(records, true);
    return;
  }

  var rmessages = [
    "メッセージありがとうございます！",
    "今日も頑張りましょう！",
    "お疲れ様です！",
    "ごみは朝に出す派？夜に出す派？",
    "今日のごみは出せましたか？", 
    "眠いですね..."
  ];

  var randomIndex = Math.floor(Math.random() * rmessages.length);

  replyMessage(event.replyToken, rmessages[randomIndex]);
}

// profileを取得してくる関数
function getUserProfile(userId) {
  const url = 'https://api.line.me/v2/bot/profile/' + userId;
  const userProfile = UrlFetchApp.fetch(url, {
    'headers': {
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}

// メッセージを返信する関数
function replyMessage(replyToken, message) {
  const url = "https://api.line.me/v2/bot/message/reply";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + ACCESS_TOKEN
  };
  const data = {
    "replyToken": replyToken,
    "messages": [
      {
        "type": "text",
        "text": message
      }
    ]
  };

  const options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(data)
  };

  UrlFetchApp.fetch(url, options);
}

// 全てのユーザーにメッセージを送信する関数
function sendMessageToAllUsers(message) {
  // ユーザーIDの列を取得
  const userIds = sheet.getRange(3, 2, sheet.getLastRow() - 2).getValues().flat();

  // 各ユーザーにメッセージを送信
  userIds.forEach(userId => {
    sendMessage(userId, message);
  });
}

// ユーザーにメッセージを送信する関数
function sendMessage(userId, message) {
  const url = "https://api.line.me/v2/bot/message/push";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + ACCESS_TOKEN
  };
  const data = {
    "to": userId,
    "messages": [
      {
        "type": "text",
        "text": message
      }
    ]
  };

  const options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(data)
  };

  UrlFetchApp.fetch(url, options);
}

function mainFunction() {
  // Google Calendar APIを有効化し、必要な権限を付与する
  var calendar = CalendarApp.getCalendarById("primary");

  // 現在の日付を取得する
  var now = new Date();

  // 次の日の日付を取得する
  var nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);

  // 現在の日付から曜日を取得する
  var dayOfWeek = nextDay.getDay();

  // 現在の日付から月を取得する
  var month = nextDay.getMonth() + 1;

  // 現在の日付から週番号を取得する
  var weekNumber = Math.floor((nextDay.getDate() - 1) / 7) + 1;

  // 出すべきゴミの種類を格納する変数
  var trashType;

  // 曜日と週番号に応じて出すべきゴミの種類を判定する
  switch (dayOfWeek) {
    case 1: // 月曜日
      if (month != 10) {
        trashType = "可燃ごみ";
      } else {
        if (weekNumber == 1) {
          trashType = "";
        } else {
          trashType = "可燃ごみ";
        }
      }
      break;
    case 4: // 木曜日
      if (month != 1) {
        trashType = "可燃ごみ";
      } else {
        if (weekNumber == 1) {
          trashType = "";
        } else {
          trashType = "可燃ごみ";
        }
      }
      break;
    case 2: // 火曜日
      if (weekNumber == 1 || weekNumber == 3) {
        trashType = "ペットボトル";
      } else if ((![6, 9, 12, 3].includes(month) && weekNumber == 2) || weekNumber == 5) {
        trashType = "";
      } else if (weekNumber == 4) {
        trashType = "埋立ごみ";
      } else {
        trashType = "水銀ごみ";
      }
      break;
    case 3: // 水曜日
      if (month != 1) {
        trashType = "プラスチック製容器包装";
      } else {
        if (weekNumber == 1) {
          trashType = "";
        } else {
          trashType = "プラスチック製容器包装";
        }
      }
      break;
    case 5: // 金曜日
      if (([4, 5, 9, 10, 11, 2, 3].includes(month) && (weekNumber == 1 || weekNumber == 3 || weekNumber == 5)) || ([6, 7, 8, 12].includes(month) && (weekNumber == 2 || weekNumber == 4))) {
        trashType = "紙類";
      } else if (month == 1) {
        if (weekNumber == 1) {
          trashType = "";
        } else if (weekNumber == 2 || weekNumber == 4) {
          trashType = "紙類";
        } else {
          trashType = "金属・ガラス類";
        }
      } else {
        trashType = "金属・ガラス類";
      }
      break;
    case 6: // 土曜日
    case 7: // 日曜日
      trashType = "";
      break;
    default:
      trashType = "";
  }

  var time = "";
  var message = "";

  if (trashType == "可燃ごみ") {
    time = "午前7時まで";
  } else if (trashType != "" && trashType != "可燃ごみ") {
    time = "午前8時まで";
  }

  // LINE Messaging APIを使用して、出すべきゴミの種類を通知するメッセージを送信する
  if (trashType != "") {
    message = "明日は" + trashType + "の日です。\n[" + time + "]";
  } else {
    message = "明日のごみの収集はありません。";
  }

  sendMessageToAllUsers(message);
}

function createTrigger() {
  var allTriggers = ScriptApp.getProjectTriggers();
  var existingTrigger = null;

  // すでに存在するmyFunctionトリガーを探す
  for (var i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getHandlerFunction() === 'mainFunction') {
      existingTrigger = allTriggers[i];
      break;
    }
  }

  // すでに存在するトリガーがあれば削除
  if (existingTrigger !== null) {
    ScriptApp.deleteTrigger(existingTrigger);
  }

  // 新しいトリガーを作成
  var triggerDay = new Date();
  triggerDay.setDate(triggerDay.getDate() + 1);
  triggerDay.setHours(21);
  triggerDay.setMinutes(00);
  triggerDay.setSeconds(00);

  ScriptApp.newTrigger('mainFunction')
    .timeBased()
    .at(triggerDay)
    .create();

  // トリガー設定日時を記録
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('TriggerSetAt', triggerDay.toString());
}
