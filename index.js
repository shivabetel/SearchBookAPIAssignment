const expresss = require('express');
const dataCollection = require('data-collection');
const data = require('./data/data.json')

const app = expresss();
const port = 3000
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next();
})
const summariesCollection = new dataCollection(data['summaries'])


app.get('/', (req, res) => {
    res.send("Welcome - Book Search API : \n Here are the list of apis that this application offers \n 1. Search : /api/search \n 2. /api/suggestions")
})

app.get('/api/search', (req, res) => {
    const id = req.query['id']
    let summaries = summariesCollection.query().filter({ id: parseInt(id) }).values()
    summaries = summaries.map(({ summary = '', id }) => {
        let author = data['authors'].find(author => author['book_id'] === id)
        return {
            summary,
            id,
            title: data['titles'][id],
            author: author['author']
        }
    })
    res.send({
        summaries
    })
})


app.get('/api/suggestions', (req, res) => {

    const keyWord = req.query['keyWord'];
    const noOfSuggestions =  req.query['noOfSuggestions'] && parseInt(req.query['noOfSuggestions']);
    if (keyWord.length >= 3) {
        let summaries = summariesCollection.query().filter({ summary__icontains: keyWord }).limit(1,noOfSuggestions).values()
        let titles = summaries.map(({ id }) => {
            return {
                title: data['titles'][id],
                id: id
            }
        }).sort((a,b) => {
            if(a['title'] < b['title'])return -1
            else if(a['title']>b['title']) return 1
            else return 0
        })
        res.send({
            suggestions: titles
        })
    }


})


app.listen(port, console.log(`listening on port ${port}`));