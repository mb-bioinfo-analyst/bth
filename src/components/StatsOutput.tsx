interface Stat {
  label: string
  value: string | number
}

interface StatsOutputProps {
  title?: string
  stats?: Stat[]
  placeholder?: string
}

export default function StatsOutput({
  title = "Results",
  stats = [],
  placeholder = "Results will appear here..."
}: StatsOutputProps){

  return (

    <div className="p-6 bg-gray-50 flex flex-col h-full">

      <h2 className="font-semibold text-lg mb-3">
        {title}
      </h2>

      <div className="flex-1 flex items-center justify-center bg-white border border-gray-300 rounded-lg">

        {stats.length === 0 ? (

          <p className="text-gray-500">
            {placeholder}
          </p>

        ) : (

          <div className="grid grid-cols-2 gap-6 text-center">

            {stats.map((s,i)=>(

              <div key={i}>

                <p className="text-sm text-gray-500">
                  {s.label}
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {s.value}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  )

}