import { BsArrowRight } from "react-icons/bs";
function Card({width,start,para,hover}) {
  return (
    <div className={`${width} bg-zinc-800 rounded-xl p-5 min-h-[30rem] hover:bg-violet-600 flex flex-col justify-between`}>
        <div className='w-full'>
            <div className="w-full flex items-center justify-between ">
                <h3>Up Next: Culture </h3>
                <BsArrowRight />
            </div>
            <h1 className='text-3xl font-medium mt-5'>
                Who I am
            </h1>
        </div>
        <div className="downElem w-full ">
            {
                start && (
                    <>
                        <h1 className="text-6xl font-semibold tracking-tight leading-none">
                            Start a Project
                        </h1>
                        <button className="rounded-full mt-5 px-5 py-2 border-[1px] border-zinc">Contact Us</button>
                    </>
                )
            }
            
            {
                para && (
                        <p className="text-sm text-zinc-500 font-medium ">Lorem, ipsum dolor sit amet consectetur adipisicing.</p>
                )
            }
        </div>
    </div>
  )
}

export default Card