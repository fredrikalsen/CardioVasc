import React from 'react';
import '../styles/About.css';
import Header from '../components/Header';

function About() {
  const heartConditions = [
    { name: "Angina", description: "Chest pain due to reduced blood flow to the heart." },
    { name: "Atrial Fibrillation", description: "Irregular heart rhythm increasing stroke risk." },
    { name: "Heart Arrhythmia", description: "Abnormal heart rhythm affecting heart rate." },
    { name: "Heart Attack", description: "Blocked blood flow causing heart muscle damage." },
    { name: "Heart Failure", description: "Heart's inability to pump blood effectively." },
    { name: "Valve Problems", description: "Issues with heart valves affecting blood flow." },
    { name: "Hypertension", description: "High blood pressure increasing heart disease risk." },
    { name: "Irregular Heartbeat", description: "Heart rhythm that's too fast, too slow, or erratic." },
    { name: "High Blood Pressure", description: "A condition where the force of the blood against artery walls is too high." },
    { name: "Coronary Heart Disease", description: "Narrowed coronary arteries reducing oxygen supply to the heart." },
    { name: "Stroke", description: "A sudden loss of brain function due to disrupted blood flow." },
    { name: "High Cholesterol", description: "Excess cholesterol in the blood increasing heart disease risk." },
    { name: "Heart Disease (MI or CHD)", description: "A range of conditions affecting the heart, including myocardial infarction and coronary heart disease." }
  ];

  return (
    <>
      <Header />
      <div className="about-wrapper">
        <div className="about-hero">
          <div className="hero-content">
            <h1>curAIHeart</h1>
            <p>Understanding Common Cardiovascular Issues</p>
          </div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="main-content">
          <h2>What We Cover</h2>
          <div className="conditions-grid">
            {heartConditions.map((condition, index) => (
              <div key={index} className="condition-card">
                <div className="card-icon">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="card-content">
                  <h3>{condition.name}</h3>
                  <p>{condition.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="data-source-card">
            <h3>Data Sources</h3>
            <p>Information provided on this platform is sourced from:</p>
            <ul>
              <li>UK Biobank – A large-scale biomedical database from around 500,000 UK participants. It is widely used for medical and public health research.</li>
              <li>CDC (Centers for Disease Control and Prevention) - Data collected through national health records, surveys (such as phone-based surveys like the Behavioral Risk Factor Surveillance System)</li>
              <li>IHME, Global Burden of Disease</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
