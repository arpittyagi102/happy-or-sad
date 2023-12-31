import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Sentiment from "sentiment";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  const [sentList,setSentiList]=useState([])
  const [videoId, setVideoId] = useState("");
  const [result, setResult] = useState({
    positive:0,
    neutral:0,
    negative:0
  })
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  async function handleClick() {
    const url = new URL(inputValue);
    const { hostname,search,pathname } = url;
  
    if (hostname === "youtu.be") {
      setVideoId(pathname.slice(1));
    }
    else if(hostname === "www.youtube.com") {
      setVideoId(search.slice(3, 17));
    }
    else{
      console.log("Error ")
    }
  }
  
  useEffect(() => {
    setMounted(true)
  },[])

  useEffect(()=>{
    if(!videoId) return;

    async function fetchData(){
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?videoId=${videoId}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&part=snippet,replies&maxResults=100`
        );
        if (response.ok) {
          const data = await response.json();
          const temp = data.items.map(
            (item) => item.snippet.topLevelComment.snippet.textDisplay
          );

          setCommentsList(temp);
        } else {
          console.log('Error:', response.status);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    }
    fetchData();
  },[videoId]) 
    

  useEffect(() => {
    if(!commentsList.length) return
    if (commentsList.length > 0) {
      const sentimentList = commentsList.map(comment => {
        const sentiment = new Sentiment();
        return sentiment.analyze(comment).score;
      });
      setSentiList(sentimentList);
  
      let positive = 0;
      let neutral = 0;
      let negative = 0;
      sentimentList.forEach(element => {
        if (element > 0) {
          positive++;
        } else if (element === 0) {
          neutral++;
        } else {
          negative++;
        }
      });
      let sum=(positive+negative+neutral)/100;
      positive /= sum;
      negative /= sum;
      neutral /= sum;
      setResult({ positive, neutral, negative });
    }
  }, [commentsList]);

  return (
    <main className={`flex min-h-screen flex-col items-center`}>

      <nav className="border p-7 w-full flex justify-between sm:p-2">
        <div className=" text-3xl font-bold sm:text-xl"><span className="text-green-500">HappyorSad</span><span className="dark:text-white">.vercel.app</span></div>
        {mounted && theme === 'dark' ? (
          <button onClick={() => setTheme("light")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </button>
        ) : (
          <button onClick={() => setTheme("dark")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="40px" height="40px" viewBox="0 0 32 32" version="1.1">
              <path d="M10.895 7.574c0 7.55 5.179 13.67 11.567 13.67 1.588 0 3.101-0.38 4.479-1.063-1.695 4.46-5.996 7.636-11.051 7.636-6.533 0-11.83-5.297-11.83-11.83 0-4.82 2.888-8.959 7.023-10.803-0.116 0.778-0.188 1.573-0.188 2.39z"/>
            </svg>
          </button>
        )}
      </nav>

      <div className="text-4xl font-bold m-10 mb-5 sm:text-2xl mx-3">Free Youtube Comments Analyzer</div>
      <div className="text-2xl text-gray-500 sm:text-2xl mx-3">Get your youtube video comments analyzed in seconds</div>
      <div className="border-8 flex items-strech w-1/2 h-16 mt-10 border-green-200 dark:border-green-700 sm:w-11/12">
          <input type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className=" text-xl grow me-2 placeholder:text-gray-700 pl-5 focus:outline-none sm:text-sm"
            placeholder="Paste your video link here..."
          ></input>
          <button className="bg-green-800 h-full w-20 text-white sm:w-16" onClick={handleClick}> Go </button>
      </div>

      <div className={`rounded-full h-10 overflow-hidden min-w-min mt-8 w-1/3 md:w-11/12 ${commentsList.length ? "flex" : "hidden"}`}>
        <div /* style={{width:4*result.positive+"px"}} */  style={{flex:result.positive}} className="h-full bg-green-500 inline-block"></div>
        <div /* style={{width:4*result.neutral+"px"}} */ style={{flex:result.neutral}} className="h-full bg-gray-400 inline-block"></div>
        <div /* style={{width:4*result.negative+"px"}} */ style={{flex:result.negative}} className="h-full bg-red-500 inline-block"></div>
      </div>
      <div className={`text-blue-500 ${commentsList.length ? "flex" : "hidden"} `}><br/>*above visual representation shows the green, grey and red color in the <br/> ratio of positive, neutral and negative comments on the video respectively</div>

      <div className="border-8 flex items-strech w-1/2 mt-10 bg-green-200 border-green-200 text-black text-xl p-2 h-min sm:w-11/12 dark:bg-green-700 dark:border-green-700 dark:text-white">
        👽 This Analyzer is not 100% accurate
      </div>
       
      <div className=" font-bold text-xl m-10 ">
        Support us :
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30" className="dark:fill-white inline-block ms-2">
          <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48" className="inline-block ms-2">
          <path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path><path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
        </svg>
      </div>
    </main>
  );
}
