function setYouTubeAudioURL(videoElement, url)
{
    function setAudioURL()
    {
        if (videoElement.src  != url)
        {
            videoElement.pause();
            videoElement.src = url;
            videoElement.currentTime = 0;
            videoElement.play();
        }
    }
    setAudioURL();
    return setAudioURL;
}

browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse)
    {
        var url = request.url;
        var videoElements = document.getElementsByTagName('video');
        var videoElement = videoElements[0];
        videoElement.onloadeddata = setYouTubeAudioURL(videoElement, url);
        if (document.getElementsByClassName('youtube_audio_div').length == 0)
        {
            var extensionAlert = document.createElement('div');
            extensionAlert.className = 'youtube_audio_div';

            var alertText = document.createElement('p');
            alertText.className = 'audio_text';
            alertText.innerHTML = 'Youtube Audio extension is running. <br>' +
            'Please disable the extension if you wish to watch the video. <br>' +
            'Thank you !';

            extensionAlert.appendChild(alertText);
            var parent = videoElement.parentNode.parentNode;
            parent.appendChild(extensionAlert);
        }
    }
);
