const puppy = require('puppeteer')
const sqlite = require('sqlite3')


const mainFun = async () => {
    

    const db = new sqlite.Database('sqlite.db')
    db.run('CREATE TABLE IF NOT EXISTS quotes ( id INTEGER PRIMARY KEY AUTOINCREMENT, quote TEXT, writer TEXT)')

    const broweser = await puppy.launch({
        headless: false
    })
    const page = await broweser.newPage()

    const fetch = async (pageNumber) => {
        await page.goto(`https://www.goodreads.com/quotes/tag/motivational?page=${pageNumber}`)

        // await page.waitForTimeout(2000)


        const parent = await page.$$eval('.quote', (elements) => {
            
            const result = []
            for(const element of elements){

                try{
                    const quote = element.querySelector(".quoteText").innerText

                    const filtered = quote.split('\n')

                    if(filtered.length > 2){
                        continue
                    }

                    result.push({
                        "quote": filtered[0],
                        "writer": filtered[1]
                    })
                }
                catch(error){
                    console.log(error)
                    continue
                }
            }

            return result
        })

        const dbInsert = db.prepare('INSERT INTO quotes (quote, writer) VALUES (?, ?)')

        parent.forEach(item => {
            dbInsert.run(item.quote, item.writer)
        })
        dbInsert.finalize()
        console.log(`iteration ${pageNumber} comepleted`)

    }
    for(let i = 1; i <= 95; i++){
        await fetch(i)
    }

    db.close()

    
}

mainFun()



