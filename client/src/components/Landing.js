import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";

const BASE_URL = "http://65.0.181.170:5000/compile"
const DOWNLOAD_URL = "http://65.0.181.170:5000/load"
const codeDefault = `#include<stdio.h>
int main()
{
  printf("Helo");
  return 0;
}
`;

const Landing = () => {
  const [code, setCode] = useState(codeDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [loading, setLoading] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };
  const handleCompile = () => {
    console.log("test123")
    setProcessing(true);
    const formData = {
      language_id: language.id,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: BASE_URL,
      params: { base64_encoded: "true", fields: "*"},
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json"
      },
      data: formData,
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token, response);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);

          showErrorToast(
            `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
            10000
          );
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token, response) => {
    
    try {
      let statusId = response.data.status?.id;
      // console.log(response.data)
      if (statusId === 1 || statusId === 2) {
        console.log("test error");
        
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        if (statusId === 6)
        {
          showErrorToast("Compilation Error")
        }
        else if (statusId === 3)
        {
          showSuccessToast(`Compiled Successfully!`);
        }
        else if (statusId === 5)
        {
          showErrorToast("Time Limti Exceeded");
        }
        else
        {
          showErrorToast();
        }
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
      showErrorToast();
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  const showSuccessToast = (msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const showErrorToast = (msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const loadProgram = (programNumber) => {
    setLoading(programNumber)
    console.log(programNumber)
      const options = {
        method: "GET",
        url: DOWNLOAD_URL,
        params: { programNumber: programNumber},
        headers: {
          "content-type": "application/json",
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      };
  
      axios
        .request(options)
        .then(function (response) {
          console.log("res.data", atob(response.data.source_code));
          setCode(atob(response.data.source_code))
          onChange("code", atob(response.data.source_code))
          console.log(code+"sdfa")
          
        })
        .catch((err) => {
          console.log(err)
          let error = err.response ? err.response.data : err;
          // get error status
          let status = err.response.status;
          console.log("status", status);
          if (status === 429) {
            console.log("too many requests", status);
  
            showErrorToast(
              `Quota of 100 requests exceeded for the Day! Please read the blog on freeCodeCamp to learn how to setup your own RAPID API Judge0!`,
              10000
            );
          }
          setLoading(false);
          console.log("catch block...", error);
        });
        setLoading(false);
    };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex flex-row">
        <div className="px-4 py-2">
          <LanguagesDropdown onSelectChange={onSelectChange} />
        </div>
        <div className="px-4 py-2">
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>
        <div className="px-4 py-2"> 
        </div>
        <div className="px-4 py-2"> 
        </div>
        {/* <div className="ml-5 px-5 py-2">
          <button
              onClick={()=>{loadProgram(1)}}
              className={classnames(
                "mt-1 mx-5 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              )}
            >
              {loading===1 ? "Loading..." : "Program 1"}
            </button>
            <button
              onClick={()=>{loadProgram(2)}}
              className={classnames(
                "mt-1 mx-5 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              )}
            >
              {loading===2 ? "Loading..." : "Program 2"}
            </button>
            <button
              onClick={()=>{loadProgram(3)}}
              className={classnames(
                "mt-1 mx-5 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              )}
            >
              {loading===3 ? "Loading..." : "Program 3"}
            </button>
            <button
              onClick={()=>{loadProgram(4)}}
              className={classnames(
                "mt-1 mx-5 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              )}
            >
              {loading===4 ? "Loading..." : "Program 4"}
            </button>
            <button
              onClick={()=>{loadProgram(5)}}
              className={classnames(
                "mt-1 mx-5 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
              )}
            >
              {loading===5 ? "Loading..." : "Program 5"}
            </button>
            
        </div> */}
      </div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="flex flex-col w-full h-full justify-start items-end">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language={language?.value}
            theme={theme.value}
          />
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
          <OutputWindow outputDetails={outputDetails} />
          <div className="flex flex-col items-end">
            <CustomInput
              customInput={customInput}
              setCustomInput={setCustomInput}
            />
            <button
              onClick={handleCompile}
              className={classnames(
                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};
export default Landing;
