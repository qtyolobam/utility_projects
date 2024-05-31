import { IoIosReturnRight } from "react-icons/io";

export default function Button({text}) {
  return (
    <div className={"w-40 px-4 py-2 bg-zinc-100 text-black rounded-full flex items-center justify-between "}>
        <span className={"text-sm font-medium"}>
            {text}
        </span>
        <IoIosReturnRight />
    </div>
  )
}
