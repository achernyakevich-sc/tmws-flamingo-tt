// ==UserScript==
// @name         Flamingo-tt
// @namespace    https://github.com/achernyakevich-sc/tmws-flamingo-tt
// @updateURL    https://github.com/achernyakevich-sc/tmws-flamingo-tt
// @downloadURL  https://github.com/achernyakevich-sc/tmws-flamingo-tt
// @version      2024-01-05
// @description  Time tracking tool for Flamingo UI.
// @match        https://flamingo.scand/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flamingo.scand
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

(function () {
  "use strict";

  function addTimerButton() {
    const toolbar = document.querySelector(".toolbar_toolbar__SFpJf");
    const refreshButton = toolbar.querySelector(
      ".toolbar_toolbar__refreshButton__A_KuV"
    );
    let button = document.getElementById("timerButton");
    let timerDisplay = document.getElementById("timerDisplay");
    let timerMenuCommandId;

    function updateMenu() {
      if (localStorage.getItem("timerStart")) {
        if (timerMenuCommandId !== undefined) {
          GM_unregisterMenuCommand(timerMenuCommandId);
        }
        timerMenuCommandId = GM_registerMenuCommand(
          "Stop",
          () => {
            button.click();
          },
          "t"
        );
      } else {
        if (timerMenuCommandId !== undefined) {
          GM_unregisterMenuCommand(timerMenuCommandId);
        }
        timerMenuCommandId = GM_registerMenuCommand(
          "Start",
          () => {
            button.click();
          },
          "t"
        );
      }
    }

    if (toolbar && !button && !timerDisplay) {
      let timer;
      let isTimerRunning;

      button = document.createElement("button");
      button.style.marginRight = "10px";
      button.style.padding = "10px";
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.id = "timerButton";
      button.style.fontSize = "16px";

      timerDisplay = document.createElement("div");
      timerDisplay.style.display = "flex";
      timerDisplay.style.justifyContent = "center";
      timerDisplay.style.alignItems = "center";
      timerDisplay.id = "timerDisplay";
      timerDisplay.style.textAlign = "center";

      function changeButtonToStop() {
        timer = setInterval(updateTimer, 1000);
        button.style.backgroundColor = "#f44336";
        button.innerHTML = "⏹️ Stop Timer";
        isTimerRunning = true;
      }

      function changeButtonToStart() {
        isTimerRunning = false;
        button.style.backgroundColor = "#4CAF50";
        button.innerHTML = "🕒 Start Timer";
        timerDisplay.textContent = "00:00:00";
      }

      function secondsToRoundedHours(seconds) {
        const hours = seconds / 3600;
        return Math.round(hours * 2) / 2;
      }

      function roundToNearest30Minutes(milliseconds) {
        const minutes = milliseconds / (1000 * 60);
        const roundedMinutes = Math.round(minutes / 30) * 30;
        return new Date(milliseconds + (roundedMinutes - minutes) * 60 * 1000);
      }

      function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }

      function updateTimer() {
        let startTime = localStorage.getItem("timerStart");
        if (startTime) {
          let elapsedTime = Math.floor(
            (Date.now() - new Date(startTime)) / 1000
          );
          let hours = Math.floor(elapsedTime / 3600);
          let minutes = Math.floor((elapsedTime % 3600) / 60);
          let seconds = elapsedTime % 60;

          hours = hours.toString().padStart(2, "0");
          minutes = minutes.toString().padStart(2, "0");
          seconds = seconds.toString().padStart(2, "0");

          timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        }
      }

      function setInputValue(input, value) {
        const enterEvent = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          keyCode: 13,
        });
        const changeEvent = new Event("change", { bubbles: true });
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        ).set;

        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(changeEvent);
        input.dispatchEvent(enterEvent);
      }

      button.addEventListener("click", function () {
        if (isTimerRunning) {
          clearInterval(timer);
          changeButtonToStart();

          const startTime = new Date(localStorage.getItem("timerStart"));
          const endTime = new Date();
          const duration = Math.floor((endTime - startTime) / 1000);
          const roundedStartTime = roundToNearest30Minutes(startTime.getTime());
          const reportButton = document.querySelector(
            ".toolbar_toolbar__addButton__EJ_d9"
          );

          reportButton.click();

          setTimeout(() => {
            let divs = document.querySelectorAll("input");
            const durationInput = document.getElementById("duration");
            const startTimeInput = document.getElementById("time");
            setInputValue(durationInput, secondsToRoundedHours(duration));
            setInputValue(startTimeInput, formatTime(roundedStartTime));
          }, 500);

          localStorage.removeItem("timerStart");
          updateMenu();
        } else {
          localStorage.setItem("timerStart", new Date());
          changeButtonToStop();
          updateMenu();
        }
      });

      changeButtonToStart();
      updateMenu();
      toolbar.insertBefore(button, refreshButton.nextSibling);
      toolbar.insertBefore(timerDisplay, button.nextSibling);

      if (localStorage.getItem("timerStart")) {
        changeButtonToStop();
      }

      document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key === "T") {
          if (button) {
            button.click();
          }
        }
      });
    }
  }

  setInterval(addTimerButton, 500);
})();
