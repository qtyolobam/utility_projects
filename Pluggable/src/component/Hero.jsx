import { useState } from "preact/hooks";

function Hero() {  

    const [images,setImages] = useState([
        { url:"https://assets-global.website-files.com/6334198f239547d0f9cd84b3/634ef09178195ce0073e38f3_Refokus%20Tools-1.png", top:"50%", left:"50%", isActive:false,},
        { url:"https://assets-global.website-files.com/6334198f239547d0f9cd84b3/634ef0accfe1b3e66bc55462_Refokus%20Tools.png", top:"56%", left:"44%", isActive:false,},
        { url:"https://assets-global.website-files.com/6334198f239547d0f9cd84b3/634ef0acbc45cb2f4fc5c6b2_Yahoo.png", top:"45%", left:"56%", isActive:false,},
        { url:"https://assets-global.website-files.com/6334198f239547d0f9cd84b3/634ef092455ce2cf591e52d1_Rainfall.png", top:"60%", left:"53%", isActive:false,},
        { url:"https://assets-global.website-files.com/6334198f239547d0f9cd84b3/634ef0ac7e7179d210dc41f0_Summon.png", top:"43%", left:"47%", isActive:false,},
        { url:"https://assets-global.website-files.com/6334198f239547d0f9cd84b3/634ef0af108a465002975acd_Showcase%20Websites%20(1).png", top:"62%", left:"50%", isActive:false,},
    ]);

    

  return (
    <div className={"w-full mt-[3%]"}>
        <div className="max-w-screen-xl mx-auto text-center relative">
            <h1 className={"text-[30vw] leading-none tracking-tight font-semibold select-none "}>work</h1> 
            <div className={"w-full h-full absolute top-0 "}>
                {images.map((elem)=>(elem.isActive && <img src={elem.url} className={"absolute w-60 rounded-lg -translate-x-[50%]  -translate-y-[50%]"} style={{top:elem.top,left:elem.left}}/> ))}
            </div>
        </div>
    </div>
  )
}

export default Hero