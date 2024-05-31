
function Stripe({val}) {
  return (
    <div className={"w-[16.66%]  px-4 py-5 border-y-[1.2px]  border-r-[1.2px] border-zinc-700 flex justify-between item-center"}>
        <img  src={val.url} alt="" />
        <span className={"font-semibold"}>{val.number}</span>
    </div>
  )
}

export default Stripe;