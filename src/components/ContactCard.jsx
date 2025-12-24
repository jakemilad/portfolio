export function ContactCard({ href, icon, title, value }) {
    return(
        <div className="w-full">
            <div className="bg-[#000033] border-2 border-[#c0c0c0] border-outset p-3 sm:p-4 hover:bg-[#000044] transition-colors">
                <a 
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-green-400 hover:text-yellow-300 no-underline group"
                >
                    <span className="text-3xl sm:text-2xl animate-[bounce_2s_infinite]">{icon}</span>
                    <div className="text-center">
                        <div className="text-base sm:text-lg font-bold">{title}</div>
                        <div className="text-xs sm:text-sm font-mono group-hover:underline break-all">{value}</div>
                    </div>
                </a>
            </div>
        </div>
    )
}

export default ContactCard;