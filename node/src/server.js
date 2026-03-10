import express from 'express'

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'eventhub-node-backend',
  })
})

app.listen(port, () => {
  console.log(`Node backend listening on http://localhost:${port}`)
})
