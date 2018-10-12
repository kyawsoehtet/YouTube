var extension = (function()
{
    var maxLength = 200;

    var ext = Object.create(null);
    var values = [];

    function extension()
    {
        this.len = function()
        {
            return values.length;
        };

        this.setMaxLength = function(len)
        {
            maxLength = len;
        };

        this.getMaxLength = function()
        {
            return maxLength;
        };

        this.insert = function(key, value)
        {
            if (this.len.apply() == this.getMaxLength.apply() &&
                typeof ext[key] == "undefined")
                {
                var id = values.shift();
                delete ext[id];
            }

            ext[key] = value;
            if (!this.contains(key))
            {
                values.push(key);
            }
        };

        this.value = function(key)
        {
            return ext[key];
        };

        this.contains = function(key)
        {
            return typeof ext[key] != "undefined";
        };

        this.remove = function(key)
        {
            if (this.contains(key))
            {
                delete ext[key];
            }
        };

        this.clear = function()
        {
            ext = Object.create(null);
            values = [];
        }
    }

    return extension;

})();

function removeURLParameters(url, parameters)
{
    parameters.forEach(function(parameter)
    {
        var urlparts = url.split('?');
        if (urlparts.length >= 2) {
            var prefix = encodeURIComponent(parameter) + '=';
            var pars = urlparts[1].split(/[&;]/g);

            for (var i = pars.length; i-- > 0;)
            {
                if (pars[i].lastIndexOf(prefix, 0) !== -1)
                {
                    pars.splice(i, 1);
                }
            }

            url = urlparts[0] + '?' + pars.join('&');
        }
    });
    return url;
}

var tab_ID = new extension();

function sendMessage(tabId)
{
    if (tab_ID.contains(tabId))
    {
        browser.tabs.sendMessage(tabId, {url: tab_ID.value(tabId)});
    }
}

function processRequest(details)
{
    if (details.url.indexOf('mime=audio') !== -1)
    {
        var parametersToBeRemoved = ['range', 'rn', 'rbuf'];
        var audioURL = removeURLParameters(details.url, parametersToBeRemoved);
        if (tab_ID.value(details.tabId) != audioURL) {
            tab_ID.insert(details.tabId, audioURL);
            browser.tabs.sendMessage(details.tabId, {url: audioURL});
        }
    }
}

function enableExtension()
{
    browser.browserAction.setIcon(
    {
        path : 
        {
            32 : "icons/logo_32.png",
            48 : "icons/logo_48.png",
        }
    });
    browser.tabs.onUpdated.addListener(sendMessage);
    browser.webRequest.onBeforeRequest.addListener(
        processRequest,
        {urls: ["<all_urls>"]},
        ["blocking"]
    );
}

function disableExtension()
{
    browser.browserAction.setIcon(
    {
        path :
        {
            32 : "icons/disabled_32.png",
            48 : "icons/disabled_48.png",
        }
    });
    browser.tabs.onUpdated.removeListener(sendMessage);
    browser.webRequest.onBeforeRequest.removeListener(processRequest);
    tab_ID.clear();

}

function saveSettings(disabled)
{
    browser.storage.local.set({'YouTube_audio_extension_disabled': disabled});
}

browser.browserAction.onClicked.addListener(function()
{
    browser.storage.local.get('YouTube_audio_extension_disabled', function(values) {
        var disabled = values.YouTube_audio_extension_disabled;

        if (disabled)
        {
            enableExtension();
        }
        else
        {
            disableExtension();
        }

        disabled = !disabled;
        saveSettings(disabled);
    });
    browser.tabs.query(
    {
        active: true,
        currentWindow: true,
        url: "*://www.youtube.com/*"
    }, function(tabs)
    {
        if (tabs.length > 0)
        {
            browser.tabs.update(tabs[0].id, {url: tabs[0].url});
        }
    });
});

browser.storage.local.get('YouTube_audio_extension_disabled', function(values) {
    var disabled = values.YouTube_audio_extension_disabled;
    if (typeof disabled === "undefined")
    {
        disabled = false;
        saveSettings(disabled);
    }

    if (disabled)
    {
        disableExtension();
    }
    else
    {
        enableExtension();
    }
});
