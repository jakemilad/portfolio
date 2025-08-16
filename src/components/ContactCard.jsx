export function ContactCard({ href, icon, title, value }) {
    return(
        <div className="max-w-md mx-auto space-y-4">
            <div className="bg-[#000033] border-2 border-[#c0c0c0] border-outset p-4 hover:bg-[#000044] transition-colors">
                <a 
                    href={href}
                    className="flex items-center justify-center gap-3 text-green-400 hover:text-yellow-300 no-underline group"
                >
                    <span className="text-2xl animate-[bounce_2s_infinite]">{icon}</span>
                    <div className="text-center">
                    <div className="text-lg font-bold">{title}</div>
                    <div className="text-sm font-mono group-hover:underline">{value}</div>
                    </div>
                </a>
            </div>
     </div>
    )
}

export default ContactCard;