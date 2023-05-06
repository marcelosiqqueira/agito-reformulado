type ListButtonProps = {
    children: string
}

export function ListButton({ children }: ListButtonProps) {
    return (
        <li className="bg-white">
            <button>
                {children}
            </button>
        </li>
    )
}