import RButton from "./Button"
import { PiPlugs } from "react-icons/pi";

function Navbar() {
  return (
    <div className={"max-w-screen-xl mx-auto py-[2.2vh] flex items-center justify-between border-b-[1px] border-zinc-700"}>
        <div className={"nav-left flex gap-3 items-center"}>  
            <PiPlugs />
            <a  href="/" className={"font-semibold"}>Pluggable</a>
            <div className="links flex gap-[3vw] ml-[8vw]"> 
                {[["Scribble","/scribble"],["Detect","/detectResults"],["ViewPDF","/viewPDF"],["",""],["Others",""]].map( 
                    (elem,index) =>(
                        elem.length === 0 ? <span className="w-[2px] h-7 bg-zinc-700"> </span> :
                        <a className="text-sm flex items-center gap-1 font-medium" href={elem[1]} >
                            { index===1 && <span style={{boxShadow:"0 0 0.45em #00FF19"}} className={"inline-block w-1 h-1 rounded-full bg-green-500"}></span> }
                            {elem[0]}
                        </a>
                    ) 
                )
                }
            </div>
        </div>
        <RButton text="Get Started" />
    </div>
  )
}

export default Navbar