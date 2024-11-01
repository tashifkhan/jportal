import Navbar from './components/navbar'

function App() {
  const data = [{
    name: "COA",
    lecture: "Dr. A.A.A",
    tutorial: "192"
  },{
    name: "COA",
    lecture: "Dr. A.A.A",
    tutorial: "192"
  },{
    name: "COA",
    lecture: "Dr. A.A.A",
    tutorial: "192"
  },{
    name: "COA",
    lecture: "Dr. A.A.A",
    tutorial: "192"
  },{
    name: "COA",
    lecture: "Dr. A.A.A",
    tutorial: "192"
  },{
    name: "COA",
    lecture: "Dr. A.A.A",
    tutorial: "192"
  },]
  return (
    <div>
      {data.map((item, index) => (
        <div key={index}>
          <p>{item.name}</p>
          <p>{item.lecture}</p>
          <p>{item.tutorial}</p>
        </div>

      ))}
    <Navbar />
    </div>
  )
}

export default App