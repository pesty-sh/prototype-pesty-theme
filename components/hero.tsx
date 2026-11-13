const CREED: [string, string][] = [
  ['what can we build?', 'Anything.'],
  ['what can we fix?', 'Everything.'],
  ['what will it cost?', 'Our dignity.'],
]

export function Hero() {
  return (
    <section aria-labelledby="pitch" className="flex flex-col gap-10 px-4 py-14 md:px-6 md:py-20">
      <h1 id="pitch" className="flex flex-col gap-5">
        {CREED.map(([question, answer], i) => (
          <span key={question} className="flex flex-col gap-1">
            <span className="text-sm font-normal text-muted-foreground">
              <span aria-hidden="true">{'> '}</span>
              {question}
            </span>
            <span className="text-4xl leading-none font-bold tracking-tight md:text-7xl">
              {answer}
              {i === CREED.length - 1 && <span className="cursor ml-3" aria-hidden="true" />}
            </span>
          </span>
        ))}
      </h1>
      <p className="max-w-xl leading-relaxed text-pretty">
        Pesty takes the job nobody else will touch and ships it anyway. No meetings. No excuses. No survivors in
        the bug tracker.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="#install"
          className="border-2 border-foreground bg-foreground px-5 py-2 text-sm font-bold text-background transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Download
        </a>
        <a
          href="#docs"
          className="border-2 border-foreground px-5 py-2 text-sm font-bold transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Docs
        </a>
      </div>
    </section>
  )
}
