import _ from "lodash";
import moment from "moment";
import Quill from "quill";
import Delta from "quill-delta";
import { io } from "socket.io-client";
import "quill/dist/quill.snow.css";
import "./style.css";

function loadFonts() {
  window.WebFontConfig = {
    google: {
      families: [
        "Inconsolata::latin",
        "Ubuntu+Mono::latin",
        "Slabo+27px::latin",
        "Roboto+Slab::latin",
      ],
    },
  };
  (function () {
    var wf = document.createElement("script");
    wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
    wf.type = "text/javascript";
    wf.async = "true";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(wf, s);
  })();
}
loadFonts();

function init() {
  var fonts = [
    "arial",
    "times",
    "sofia",
    "slabo",
    "roboto",
    "inconsolata",
    "ubuntu",
  ];
  var Font = Quill.import("formats/font");
  Font.whitelist = fonts;
  Quill.register(Font, true);

  var Bold = Quill.import("formats/bold");
  Bold.tagName = "B"; // Quill uses <strong> by default
  Quill.register(Bold, true);

  var toolbarOptions = [
    [{ font: fonts }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "super" }, { script: "sub" }],
    [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    [{ direction: "rtl" }, { align: [] }],
    ["video", "image", "clean"],
  ];

  // Initialize as you would normally
  var quill = new Quill("#editor", {
    modules: {
      toolbar: toolbarOptions,
    },
    theme: "snow",
  });

  // Store accumulated changes
  var change = new Delta();
  quill.on("text-change", function (delta, oldDetail, source) {
    console.log(`Receiving Text Change with source : ${source}`);
    if (source == "api") return;

    change = change.compose(delta);

    debounce(() => {
      console.log(`Executing`);
      if (change.length() > 0) {
        console.log("Broadcasting : ", change);
        socket.emit("message", change);
        change = new Delta();
      }
    })();
  });

  const SOCKET_URL = process.env.SOCKET_URL;
  const socket = io(SOCKET_URL, { transports: ["websocket"] });
  socket.on("message", (msg) => {
    showStatus(`${moment().format("YYYY-MM-DD hh:mm:ss SSS")} : ${msg.source} : ${JSON.stringify(msg.ops)}`);
    quill.updateContents(msg);
  });

  const terminateOne = document.querySelector("#terminateOne");
  terminateOne.addEventListener("click", async() => {
    if (confirm("Confirm to kill the server ?")){
      let response = await fetch("/api/terminate", {method: "GET"});
      let status = (response.status == 503) ? "Server is terminated." : " Something went wrong.";
      showStatus(status);
    }
  });

  const terminateAll = document.querySelector("#terminateAll");
  terminateAll.addEventListener("click", async() => {
    if (confirm("Confirm to kill all servers ?")){
      for (let i = 0; i < 3; i++){
        let response = await fetch("/api/terminate", {method: "GET"});
        if (response.status == 503){
          showStatus(`Server ${i+1} is terminated.`);
        }
        else {
          showStatus(`All servers have been terminated`);;
        }
      }
    }
  });
}

function showStatus(text){
  const textarea = document.querySelector("#textarea");
  textarea.innerHTML += `${text}\n`;
}

let timer;

function debounce(func, timeout = 300) {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log("Deboucing");
      func.apply(this, args);
    }, timeout);
  };
}

document.addEventListener("DOMContentLoaded", init);
