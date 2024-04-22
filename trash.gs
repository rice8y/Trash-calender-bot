function createTrigger() {
  var allTriggers = ScriptApp.getProjectTriggers();
  var existingTrigger = null;

  // すでに存在するmyFunctionトリガーを探す
  for (var i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getHandlerFunction() === 'myFunction') {
      existingTrigger = allTriggers[i];
      break;
    }
  }

  // すでに存在するトリガーがあれば削除
  if (existingTrigger !== null) {
    ScriptApp.deleteTrigger(existingTrigger);
  }

function myFunction() {
    // LINE Messaging APIを使用するためのアクセストークンやチャンネルIDなどを設定する
    var ACCESS_TOKEN = "YOUR_ACCES_TOKEN";
    var USER_ID = "YOUR_USER_ID";

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

    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", {
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + ACCESS_TOKEN
        },
        "method": "post",
        "payload": JSON.stringify({
            "to": USER_ID,
            "messages": [{
                "type": "text",
                "text": message
            }]
        })
    });
}

  // 新しいトリガーを作成
  var triggerDay = new Date();
  triggerDay.setDate(triggerDay.getDate() + 1);
  triggerDay.setHours(21);
  triggerDay.setMinutes(0);
  triggerDay.setSeconds(0);

  ScriptApp.newTrigger('myFunction')
    .timeBased()
    .at(triggerDay)
    .create();

  // トリガー設定日時を記録
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('TriggerSetAt', triggerDay.toString());
}
