import RButton from './Button';


function Product({val}) {

  return (
    <div className={"w-full py-20 text-white"}>
        <div className={"max-w-screen-xl mx-auto flex items-center justify-between"}>
            <h1 className={"text-6xl capitalize font-semibold"}>{val.title}</h1>
            <div className="dets w-1/3">
                <p className={"mb-10"}>{val.description}</p>
                    <div className={"flex gap-10"}>
                        {val.live && <RButton text="Live"/>}
                        {val.case && <RButton text="Case"/>}
                    </div> 
    
            
            </div>
        </div>
    </div>
  )
}

export default Product