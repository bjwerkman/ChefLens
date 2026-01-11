export const Badge = ({ type, value }: { type: 'time' | 'temp' | 'speed' | 'mode', value: string }) => {
    const colors = {
        time: 'bg-blue-500 text-white',
        temp: 'bg-amber-400 text-black',
        speed: 'bg-green-500 text-white',
        mode: 'bg-purple-500 text-white'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[type]}`}>
            {value}
        </span>
    );
};
