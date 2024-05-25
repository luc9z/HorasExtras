import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [entries, setEntries] = useState([]);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [percentage, setPercentage] = useState('50');
  const [report50, setReport50] = useState([]);
  const [report100, setReport100] = useState([]);
  const [total50Hours, setTotal50Hours] = useState(0);
  const [total50Minutes, setTotal50Minutes] = useState(0);
  const [total100Hours, setTotal100Hours] = useState(0);
  const [total100Minutes, setTotal100Minutes] = useState(0);

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('entries')) || [];
    setEntries(storedEntries);
  }, []);

  const handleAddEntry = () => {
    const newEntry = { day, month, hours, minutes, percentage };
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    localStorage.setItem('entries', JSON.stringify(updatedEntries));

    setDay('');
    setMonth('');
    setHours('');
    setMinutes('');
  };

  const handleGenerateReport = () => {
    const report50Entries = entries.filter(entry => entry.percentage === '50');
    const report100Entries = entries.filter(entry => entry.percentage === '100');

    setReport50(report50Entries);
    setReport100(report100Entries);

    calculateTotals(report50Entries, setTotal50Hours, setTotal50Minutes);
    calculateTotals(report100Entries, setTotal100Hours, setTotal100Minutes);
  };

  const handleClearReport = () => {
    setEntries([]);
    setReport50([]);
    setReport100([]);
    localStorage.removeItem('entries');
    setTotal50Hours(0);
    setTotal50Minutes(0);
    setTotal100Hours(0);
    setTotal100Minutes(0);
  };

  const calculateTotals = (entries, setTotalHours, setTotalMinutes) => {
    let totalH = 0;
    let totalM = 0;

    entries.forEach(entry => {
      totalH += parseInt(entry.hours, 10);
      totalM += parseInt(entry.minutes, 10);
    });

    totalH += Math.floor(totalM / 60);
    totalM = totalM % 60;

    setTotalHours(totalH);
    setTotalMinutes(totalM);
  };

  return (
    <div className="App">
      <h1>Gerenciamento de Horas Extras</h1>
      <div className="form">
        <label>Dia:</label>
        <input type="number" value={day} onChange={(e) => setDay(e.target.value)} />
        <label>Mês:</label>
        <input type="number" value={month} onChange={(e) => setMonth(e.target.value)} />
        <label>Horas:</label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} />
        <label>Minutos:</label>
        <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        <label>Porcentagem:</label>
        <select value={percentage} onChange={(e) => setPercentage(e.target.value)}>
          <option value="50">50%</option>
          <option value="100">100%</option>
        </select>
        <button onClick={handleAddEntry}>Adicionar</button>
      </div>
      <div className="report">
        <h2>Relatórios</h2>
        <button onClick={handleGenerateReport}>Gerar Relatórios</button>
        <button onClick={handleClearReport}>Limpar Relatórios</button>
        
        <div className="report-section">
          <h3>Relatório 50%</h3>
          <ul>
            {report50.map((entry, index) => (
              <li key={index}>{`Dia: ${entry.day}, Mês: ${entry.month}, Horas: ${entry.hours}, Minutos: ${entry.minutes}, Porcentagem: ${entry.percentage}%`}</li>
            ))}
          </ul>
          <div className="totals">
            <h4>Total de Horas 50%</h4>
            <p>{`${total50Hours} horas e ${total50Minutes} minutos`}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>Relatório 100%</h3>
          <ul>
            {report100.map((entry, index) => (
              <li key={index}>{`Dia: ${entry.day}, Mês: ${entry.month}, Horas: ${entry.hours}, Minutos: ${entry.minutes}, Porcentagem: ${entry.percentage}%`}</li>
            ))}
          </ul>
          <div className="totals">
            <h4>Total de Horas 100%</h4>
            <p>{`${total100Hours} horas e ${total100Minutes} minutos`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
