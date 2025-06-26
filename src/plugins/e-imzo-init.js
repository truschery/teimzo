var EIMZO_MAJOR = 3
var EIMZO_MINOR = 37

var errorCAPIWS =
  "Ошибка соединения с E-IMZO. Возможно у вас не установлен модуль E-IMZO или Браузер E-IMZO."
var errorBrowserWS =
  "Браузер не поддерживает технологию WebSocket. Установите последнюю версию браузера."
var errorUpdateApp =
  'ВНИМАНИЕ !!! Установите новую версию приложения E-IMZO или Браузера E-IMZO.<br /><a href="https://e-imzo.uz/main/downloads/" role="button">Скачать ПО E-IMZO</a>'
var errorWrongPassword = "Пароль неверный."

var AppLoad = function () {
  // if (window.app_type === 'dev') {
  //   let eimzoKeys = localStorage.getItem("eimzoKeys")
  //
  //   if (eimzoKeys) {
  //     eimzoKeys = JSON.parse(eimzoKeys)
  //     if (new Date(eimzoKeys.expired_at) < new Date()) {
  //       eimzoKeys = null
  //     }
  //   }
  //
  //   if (
  //     eimzoKeys &&
  //     eimzoKeys.profile_uuid === window.currentProfile.profile_uuid
  //   ) {
  //     uiFillCombo(eimzoKeys.keys.map(item => {
  //       return uiCreateItem(item.id, item.data)
  //     }))
  //
  //     window.emitter.emit("eimzoLoad")
  //
  //     window.emitter.emit('eimzoKeysLoaded', eimzoKeys.keys)
  //     uiLoaded()
  //
  //     return
  //   }
  //
  // }

  localStorage.removeItem('eimzoKeys')

  EIMZOClient.API_KEYS = [
    'null',
    'E0A205EC4E7B78BBB56AFF83A733A1BB9FD39D562E67978CC5E7D73B0951DB1954595A20672A63332535E13CC6EC1E1FC8857BB09E0855D7E76E411B6FA16E9D',
    'localhost',
    '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
    '127.0.0.1',
    'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
    'dls.yt.uz',
    'EDC1D4AB5B02066FB3FEB9382DE6A7F8CBD095E46474B07568BC44C8DAE27B3893E75B79280EA82A38AD42D10EA0D600E6CE7E89D1629221E4363E2D78650516',
    'micros24.uz',
    '9FDEE1910E4370A67E7BEB7CD07A22CBA7B3EF086E0B2B4C6A0C20E3C77ACD07E791DF41387FF3A188F3E31215BD1BD1E9A40171911A950742D0AFF4C185BD33',
    'app.micros24.uz',
    'FE2339FEBEDD940510402FEF0B48B0B7CA6E92AEEE9BBAFCC0E6C4D51261BDA7F3DDF0E7651A6F0AA172663FAE1DE77B9C9ABDF875DFBA6C42BA1C891DCAC0C4',
    'app.multibank.uz',
    '8BE9165A95538CCFC232EFFAE9136F9F26AB75D7C20D1F09A21B90475F0A5F5BCB1838335CC0D4C66A92CB7A0A76E8CA764E344FB8C8E635F40BAA40138436C4',
    'multibank.uz',
    '106E40FC223EF60EC315D10AE8C3CA026E02DAF0F356DE72D93B65021C9018961D47C4D4113F74EA9152DB3C93BBAEE8B6C6D4F03EA651C10912021DD03E5E0C',
  ]

  uiLoading()
  EIMZOClient.checkVersion(
    function (major, minor) {
      var newVersion = EIMZO_MAJOR * 100 + EIMZO_MINOR
      var installedVersion = parseInt(major) * 100 + parseInt(minor)
      if (installedVersion < newVersion) {
        window.eimzoEmitter.emit("eimzo:update")
        uiUpdateApp()
      } else {
        EIMZOClient.installApiKeys(
          function () {
            window.eimzoEmitter.emit("eimzo:load")
            uiAppLoad()
          },
          function (e, r) {
            if (r) {
              uiShowMessage(r)
            } else {
              wsError(e)
            }
          },
        )
      }
    },
    function (e, r) {
      window.eimzoEmitter.emit("eimzo:not-installed", e ?? r)
      if (r) {
        uiShowMessage(r)
      } else {
        uiNotLoaded(e)
      }
    },
  )
}

var uiShowProgress = function () {
  // show loaging indicator
}

var uiHideProgress = function () {
  // hide loaging indicator
}

var uiLoading = function () {
  // show loaging indicator
}

var uiLoaded = function () {
  // hide loaging indicator
}

var uiShowMessage = function (message) {
  window.eimzoEmitter.emit("eimzo:message", message)

  // alert(message);
}

var uiUpdateApp = function () {
  // show message "Update E-IMZO"
}

var uiNotLoaded = function (e) {
  // show message "E-IMZO not installed"
  uiShowMessage(errorCAPIWS + " : " + wsErroCodeDesc(e))
}

var wsErroCodeDesc = function (code) {
  var reason
  if (code == 1000)
    reason =
      code +
      " - " +
      "Обычное замыкание, означающее, что цель, для которой было установлено соединение, была достигнута."
  else if (code == 1001)
    reason =
      code +
      " - " +
      'Конечная точка "уходит", например, сервер отключается или браузер переходит на другую страницу.'
  else if (code == 1002)
    reason =
      code +
      " - " +
      "Конечная точка завершает соединение из-за протокольной ошибки"
  else if (code == 1003)
    reason =
      code +
      " - " +
      "Конечная точка завершает соединение из-за типа данных, которые она не может принять (например, конечная точка, которая понимает только текстовые данные, может отправить это, если получит двоичное сообщение)."
  else if (code == 1004)
    reason =
      code +
      " - " +
      "Зарезервировано. Конкретный смысл может быть определен в будущем."
  else if (code == 1005)
    reason = code + " - " + "Не был представлен фактический статусный код."
  else if (code == 1006)
    reason =
      code +
      " - " +
      "Соединение было закрыто аномально, например, без отправки или получения фрейма Close"
  else if (code == 1007)
    reason =
      code +
      " - " +
      "Конечная точка завершает соединение, потому что она получила данные в сообщении, которые не согласовывались с типом сообщения."
  else if (code == 1008)
    reason =
      code +
      " - " +
      'Конечная точка завершает соединение, потому что она получила сообщение, которое нарушает ее политику. Этот код применяется, если нет другой подходящей причины или если необходимо скрыть конкретные детали политики.'
  else if (code == 1009)
    reason =
      code +
      " - " +
      "Конечная точка завершает соединение, потому что она получила сообщение, которое слишком велико для его обработки."
  else if (code == 1010)

    // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
    reason =
      code +
      " - " +
      "Конечная точка (клиент) завершает соединение, потому что она ожидала, что сервер будет договариваться о одном или нескольких расширениях, но сервер не вернул их в сообщении WebSocket handshake."
  else if (code == 1011)
    reason =
      code +
      " - " +
      "Сервер завершает соединение, потому что он столкнулся с неожиданным условием, которое помешало ему выполнить запрос."
  else if (code == 1015)
    reason =
      code +
      " - " +
      "Соединение было закрыто из-за неудачного выполнения TLS handshake (например, сертификат сервера не может быть проверен)."
  else reason = code

  return reason
}

window.eimzoErrorCodeDesc = wsErroCodeDesc

var wsError = function (e) {
  if (e) {
    uiShowMessage(errorCAPIWS + " : " + wsErroCodeDesc(e))
  } else {
    uiShowMessage(errorBrowserWS)
  }
}

var uiAppLoad = function () {
  // Load your App
}

var uiHandleError = function (e, r) {
  uiHideProgress()
  if (r) {
    if (r.indexOf("BadPaddingException") != -1) {
      uiShowMessage(errorWrongPassword)
    } else {
      uiShowMessage(r)
    }
  } else {
    uiShowMessage(errorBrowserWS)
  }
  if (e) wsError(e)
}
