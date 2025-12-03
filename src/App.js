import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Code, Database, Plug, Calculator, AlertCircle, CheckCircle, Save, Download, Trash2, FileText, BarChart3 } from 'lucide-react';
import ChatWidget from './components/ChatWidget';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const PDF_SERVICE_URL = process.env.REACT_APP_PDF_SERVICE_URL || 'http://localhost:5001';

// Helper function to safely format numbers
const safeNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

export default function RORACCalculator() {
  // CFA Branding
  const COMPANY_NAME = 'A CFAi App';
  const COMPANY_LOGO = '/logo.jpg'; // upper left
  const PRIMARY_COLOR = 'green'; // Options: blue, green, purple, red, indigo
  
  const [dealName, setDealName] = useState('');
  const [savedDeals, setSavedDeals] = useState([]);
  const [showSavedDeals, setShowSavedDeals] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);
  
  // Loan Details
  const [loanAmount, setLoanAmount] = useState('');
  const [points, setPoints] = useState('');
  const [loanTerm, setLoanTerm] = useState('36');
  
  // Licensing Costs
  const [licenseCostPerUser, setLicenseCostPerUser] = useState('');
  const [licenseUsers, setLicenseUsers] = useState('');
  const [licenseBaseCost, setLicenseBaseCost] = useState('');
  
  // Resource Costs - Implementation
  const [internalRate, setInternalRate] = useState('');
  const [internalHours, setInternalHours] = useState('');
  const [vendorRate, setVendorRate] = useState('');
  const [vendorHours, setVendorHours] = useState('');
  
  // Maintenance Costs (Annual)
  const [annualMaintenanceHours, setAnnualMaintenanceHours] = useState('');
  const [maintenanceRate, setMaintenanceRate] = useState('');
  
  // Custom Development
  const [configHours, setConfigHours] = useState('');
  const [configRate, setConfigRate] = useState('');
  const [codeHours, setCodeHours] = useState('');
  const [codeRate, setCodeRate] = useState('');
  const [databaseHours, setDatabaseHours] = useState('');
  const [databaseRate, setDatabaseRate] = useState('');
  const [apiHours, setApiHours] = useState('');
  const [apiRate, setApiRate] = useState('');
  
  // Fees
  const [creditPullFee, setCreditPullFee] = useState('');
  const [uccCost, setUccCost] = useState('');
  const [uccPaidBy, setUccPaidBy] = useState('client'); // 'paid' or 'client'
  const [modificationFee, setModificationFee] = useState('');
  const [modificationPaidBy, setModificationPaidBy] = useState('client'); // 'paid' or 'client'
  
  // Approval Thresholds
  const [cooThreshold, setCooThreshold] = useState('100000');
  const [ceoThreshold, setCeoThreshold] = useState('250000');

  // Load saved deals on mount
  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const result = await window.storage.list('deal:');
      if (result && result.keys) {
        const deals = [];
        for (const key of result.keys) {
          try {
            const dealResult = await window.storage.get(key);
            if (dealResult) {
              deals.push(JSON.parse(dealResult.value));
            }
          } catch (err) {
            console.log('Deal not found:', key);
          }
        }
        setSavedDeals(deals);
      }
    } catch (error) {
      console.log('No saved deals found');
      setSavedDeals([]);
    }
  };

  const saveDeal = async () => {
    if (!dealName.trim()) {
      alert('Please enter a deal name before saving');
      return;
    }

    const deal = {
      id: Date.now().toString(),
      name: dealName,
      timestamp: new Date().toISOString(),
      data: {
        loanAmount, points, loanTerm,
        creditPullFee, uccCost, uccPaidBy, modificationFee, modificationPaidBy,
        licenseCostPerUser, licenseUsers, licenseBaseCost,
        internalRate, internalHours, vendorRate, vendorHours,
        annualMaintenanceHours, maintenanceRate,
        configHours, configRate, codeHours, codeRate,
        databaseHours, databaseRate, apiHours, apiRate,
        cooThreshold, ceoThreshold
      },
      results: {
        revenue: calculateRevenue(),
        totalCosts,
        netProfit,
        rorac
      }
    };

    try {
      await window.storage.set(`deal:${deal.id}`, JSON.stringify(deal));
      await loadDeals();
      alert('Deal saved successfully!');
    } catch (error) {
      alert('Error saving deal: ' + error.message);
    }
  };

  const loadDeal = async (deal) => {
    const d = deal.data;
    setDealName(deal.name);
    setLoanAmount(d.loanAmount);
    setPoints(d.points);
    setLoanTerm(d.loanTerm);
    setCreditPullFee(d.creditPullFee || '');
    setUccCost(d.uccCost || '');
    setUccPaidBy(d.uccPaidBy || 'client');
    setModificationFee(d.modificationFee || '');
    setModificationPaidBy(d.modificationPaidBy || 'client');
    setLicenseCostPerUser(d.licenseCostPerUser);
    setLicenseUsers(d.licenseUsers);
    setLicenseBaseCost(d.licenseBaseCost);
    setInternalRate(d.internalRate);
    setInternalHours(d.internalHours);
    setVendorRate(d.vendorRate);
    setVendorHours(d.vendorHours);
    setAnnualMaintenanceHours(d.annualMaintenanceHours);
    setMaintenanceRate(d.maintenanceRate);
    setConfigHours(d.configHours);
    setConfigRate(d.configRate);
    setCodeHours(d.codeHours);
    setCodeRate(d.codeRate);
    setDatabaseHours(d.databaseHours);
    setDatabaseRate(d.databaseRate);
    setApiHours(d.apiHours);
    setApiRate(d.apiRate);
    setCooThreshold(d.cooThreshold);
    setCeoThreshold(d.ceoThreshold);
    setShowSavedDeals(false);
  };

  const deleteDeal = async (dealId) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await window.storage.delete(`deal:${dealId}`);
        await loadDeals();
      } catch (error) {
        alert('Error deleting deal: ' + error.message);
      }
    }
  };

  const toggleCompare = (deal) => {
    if (selectedDeals.find(d => d.id === deal.id)) {
      setSelectedDeals(selectedDeals.filter(d => d.id !== deal.id));
    } else {
      if (selectedDeals.length < 3) {
        setSelectedDeals([...selectedDeals, deal]);
      } else {
        alert('Maximum 3 deals can be compared at once');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Deal Name', 'Date', 'Revenue', 'Total Costs', 'Net Profit', 'RORAC %', 'Requires COO', 'Requires CEO'];
    const rows = savedDeals.map(deal => [
      deal.name,
      new Date(deal.timestamp).toLocaleDateString(),
      safeNumber(deal.results?.revenue).toFixed(2),
      safeNumber(deal.results?.totalCosts).toFixed(2),
      safeNumber(deal.results?.netProfit).toFixed(2),
      safeNumber(deal.results?.rorac).toFixed(2),
      safeNumber(deal.results?.totalCosts) >= parseFloat(deal.data?.cooThreshold || 0) ? 'Yes' : 'No',
      safeNumber(deal.results?.totalCosts) >= parseFloat(deal.data?.ceoThreshold || 0) ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deals_export.csv';
    a.click();
  };

  const exportCurrentDeal = async () => {
    const dealData = {
      dealName,
      timestamp: new Date().toISOString(),
      inputs: {
        loan: { amount: loanAmount, points, term: loanTerm },
        fees: { 
          creditPull: creditPullFee,
          ucc: { cost: uccCost, paidBy: uccPaidBy },
          modification: { cost: modificationFee, paidBy: modificationPaidBy }
        },
        licensing: { baseCost: licenseBaseCost, perUser: licenseCostPerUser, users: licenseUsers },
        implementation: { internalRate, internalHours, vendorRate, vendorHours },
        maintenance: { annualHours: annualMaintenanceHours, rate: maintenanceRate },
        customDev: { 
          config: { hours: configHours, rate: configRate },
          code: { hours: codeHours, rate: codeRate },
          database: { hours: databaseHours, rate: databaseRate },
          api: { hours: apiHours, rate: apiRate }
        }
      },
      results: {
        revenue: calculateRevenue(),
        costs: {
          fees: calculateFees(),
          licensing: calculateLicensing(),
          implementation: calculateImplementation(),
          maintenance: calculateMaintenance(),
          customDev: calculateCustomDev(),
          total: totalCosts
        },
        netProfit,
        rorac,
        approvals: {
          requiresCOO: totalCosts >= parseFloat(cooThreshold),
          requiresCEO: totalCosts >= parseFloat(ceoThreshold)
        }
      }
    };

    try {
      const response = await fetch(`${PDF_SERVICE_URL}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dealData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dealName || 'deal'}_analysis.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Make sure the PDF service is running.');
    }
  };

  const clearForm = () => {
    if (window.confirm('Clear all fields?')) {
      setDealName('');
      setLoanAmount('');
      setPoints('');
      setLoanTerm('36');
      setCreditPullFee('');
      setUccCost('');
      setUccPaidBy('client');
      setModificationFee('');
      setModificationPaidBy('client');
      setLicenseCostPerUser('');
      setLicenseUsers('');
      setLicenseBaseCost('');
      setInternalRate('');
      setInternalHours('');
      setVendorRate('');
      setVendorHours('');
      setAnnualMaintenanceHours('');
      setMaintenanceRate('');
      setConfigHours('');
      setConfigRate('');
      setCodeHours('');
      setCodeRate('');
      setDatabaseHours('');
      setDatabaseRate('');
      setApiHours('');
      setApiRate('');
    }
  };

  // Calculations
  const calculateRevenue = () => {
    const loan = parseFloat(loanAmount) || 0;
    const pointsValue = parseFloat(points) || 0;
    return loan * (pointsValue / 100);
  };

  const calculateLicensing = () => {
    const baseCost = parseFloat(licenseBaseCost) || 0;
    const perUser = parseFloat(licenseCostPerUser) || 0;
    const users = parseFloat(licenseUsers) || 0;
    const term = parseFloat(loanTerm) || 36;
    
    const monthlyLicense = baseCost + (perUser * users);
    return monthlyLicense * term;
  };

  const calculateImplementation = () => {
    const intRate = parseFloat(internalRate) || 0;
    const intHours = parseFloat(internalHours) || 0;
    const vRate = parseFloat(vendorRate) || 0;
    const vHours = parseFloat(vendorHours) || 0;
    
    return (intRate * intHours) + (vRate * vHours);
  };

  const calculateMaintenance = () => {
    const hours = parseFloat(annualMaintenanceHours) || 0;
    const rate = parseFloat(maintenanceRate) || 0;
    const years = (parseFloat(loanTerm) || 36) / 12;
    
    return hours * rate * years;
  };

  const calculateCustomDev = () => {
    const config = (parseFloat(configHours) || 0) * (parseFloat(configRate) || 0);
    const code = (parseFloat(codeHours) || 0) * (parseFloat(codeRate) || 0);
    const db = (parseFloat(databaseHours) || 0) * (parseFloat(databaseRate) || 0);
    const api = (parseFloat(apiHours) || 0) * (parseFloat(apiRate) || 0);
    
    return config + code + db + api;
  };
  
  const calculateFees = () => {
    let feesCost = 0;
    
    // Credit Pull Fee (FICO, Experian, TransUnion) - always a cost
    feesCost += parseFloat(creditPullFee) || 0;
    
    // UCC Cost - only a cost if we pay it
    if (uccPaidBy === 'paid') {
      feesCost += parseFloat(uccCost) || 0;
    }
    
    // Modification Fee - only a cost if we pay it
    if (modificationPaidBy === 'paid') {
      feesCost += parseFloat(modificationFee) || 0;
    }
    
    return feesCost;
  };
  
  const revenue = calculateRevenue();
  const licensingCost = calculateLicensing();
  const implementationCost = calculateImplementation();
  const maintenanceCost = calculateMaintenance();
  const customDevCost = calculateCustomDev();
  const feesCost = calculateFees();
  
  const totalCosts = licensingCost + implementationCost + maintenanceCost + customDevCost + feesCost;
  const netProfit = revenue - totalCosts;
  const rorac = revenue > 0 ? ((netProfit / totalCosts) * 100) : 0;
  
  const requiresCOO = totalCosts >= parseFloat(cooThreshold);
  const requiresCEO = totalCosts >= parseFloat(ceoThreshold);

  const colorClasses = {
    blue: {
      gradient: 'from-blue-600 to-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-600',
      ring: 'ring-blue-500'
    },
    green: {
      gradient: 'from-green-600 to-green-700',
      button: 'bg-green-600 hover:bg-green-700',
      text: 'text-green-600',
      ring: 'ring-green-500'
    },
    purple: {
      gradient: 'from-purple-600 to-purple-700',
      button: 'bg-purple-600 hover:bg-purple-700',
      text: 'text-purple-600',
      ring: 'ring-purple-500'
    },
    red: {
      gradient: 'from-red-600 to-red-700',
      button: 'bg-red-600 hover:bg-red-700',
      text: 'text-red-600',
      ring: 'ring-red-500'
    },
    indigo: {
      gradient: 'from-indigo-600 to-indigo-700',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      text: 'text-indigo-600',
      ring: 'ring-indigo-500'
    }
  };

  const colors = colorClasses[PRIMARY_COLOR] || colorClasses.blue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Company Branding */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {COMPANY_LOGO && <img src={COMPANY_LOGO} alt={COMPANY_NAME} className="h-10" />}
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Return on Risk Calculator</h1>
                <p className="text-slate-600">{COMPANY_NAME}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSavedDeals(!showSavedDeals)}
                className={`${colors.button} text-white px-4 py-2 rounded-lg transition flex items-center gap-2`}
              >
                <FileText className="w-4 h-4" />
                Saved Deals ({savedDeals.length})
              </button>
              {selectedDeals.length > 0 && (
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`${colors.button} text-white px-4 py-2 rounded-lg transition flex items-center gap-2`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Compare ({selectedDeals.length})
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Deal Name</label>
              <input
                type="text"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter deal name"
              />
            </div>
            <button
              onClick={saveDeal}
              className={`${colors.button} text-white px-6 py-2 rounded-lg transition flex items-center gap-2`}
            >
              <Save className="w-4 h-4" />
              Save Deal
            </button>
            <button
              onClick={exportCurrentDeal}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={clearForm}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Saved Deals Panel */}
        {showSavedDeals && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Saved Deals</h2>
              <button
                onClick={exportToCSV}
                className={`${colors.button} text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm`}
              >
                <Download className="w-4 h-4" />
                Export All to CSV
              </button>
            </div>
            <div className="space-y-3">
              {savedDeals.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No saved deals yet</p>
              ) : (
                savedDeals.map(deal => (
                  <div key={deal.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{deal.name}</h3>
                        <p className="text-sm text-slate-500">{new Date(deal.timestamp).toLocaleString()}</p>
                        <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-slate-600">Revenue:</span>
                            <span className="font-semibold ml-1">${safeNumber(deal.results?.revenue).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Costs:</span>
                            <span className="font-semibold ml-1">${safeNumber(deal.results?.totalCosts).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Profit:</span>
                            <span className={`font-semibold ml-1 ${safeNumber(deal.results?.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${safeNumber(deal.results?.netProfit).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">RORAC:</span>
                            <span className="font-semibold ml-1">{safeNumber(deal.results?.rorac).toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleCompare(deal)}
                          className={`px-3 py-1 rounded ${
                            selectedDeals.find(d => d.id === deal.id)
                              ? `${colors.button} text-white`
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          } transition text-sm`}
                        >
                          {selectedDeals.find(d => d.id === deal.id) ? 'Selected' : 'Compare'}
                        </button>
                        <button
                          onClick={() => loadDeal(deal)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteDeal(deal.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Comparison View */}
        {compareMode && selectedDeals.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Deal Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Metric</th>
                    {selectedDeals.map(deal => (
                      <th key={deal.id} className="text-left p-2 font-semibold">{deal.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b">
                    <td className="p-2 text-slate-600">Date</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="p-2">{new Date(deal.timestamp).toLocaleDateString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-slate-600">Revenue</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="p-2 font-semibold">${safeNumber(deal.results?.revenue).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-slate-600">Total Costs</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="p-2 font-semibold">${safeNumber(deal.results?.totalCosts).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-slate-600">Net Profit</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className={`p-2 font-semibold ${safeNumber(deal.results?.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${safeNumber(deal.results?.netProfit).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-slate-600">RORAC</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="p-2 font-semibold">{safeNumber(deal.results?.rorac).toFixed(2)}%</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-slate-600">COO Approval</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="p-2">
                        {safeNumber(deal.results?.totalCosts) >= parseFloat(deal.data?.cooThreshold || 0) ? '✓ Required' : '✗ Not Required'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-600">CEO Approval</td>
                    {selectedDeals.map(deal => (
                      <td key={deal.id} className="p-2">
                        {safeNumber(deal.results?.totalCosts) >= parseFloat(deal.data?.ceoThreshold || 0) ? '✓ Required' : '✗ Not Required'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Loan Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-slate-800">Loan Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount ($)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Points (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (months)</label>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="36"
                />
              </div>
            </div>
          </div>

          {/* Fees Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Fees</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Credit Pull Fees ($)</label>
                <input
                  type="number"
                  value={creditPullFee}
                  onChange={(e) => setCreditPullFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="FICO, Experian, TransUnion"
                />
                <p className="text-xs text-slate-500 mt-1">Combined cost for credit bureau reports</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">UCC Filing Cost ($)</label>
                <input
                  type="number"
                  value={uccCost}
                  onChange={(e) => setUccCost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <div className="mt-2">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      value="paid"
                      checked={uccPaidBy === 'paid'}
                      onChange={(e) => setUccPaidBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700">We Pay</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="client"
                      checked={uccPaidBy === 'client'}
                      onChange={(e) => setUccPaidBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700">Client Pays (Billback)</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modification Fees ($)</label>
                <input
                  type="number"
                  value={modificationFee}
                  onChange={(e) => setModificationFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <div className="mt-2">
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      value="paid"
                      checked={modificationPaidBy === 'paid'}
                      onChange={(e) => setModificationPaidBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700">We Pay</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="client"
                      checked={modificationPaidBy === 'client'}
                      onChange={(e) => setModificationPaidBy(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700">Client Pays (Billback)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Licensing Costs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-800">Licensing Costs</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Cost ($/month)</label>
                <input
                  type="number"
                  value={licenseBaseCost}
                  onChange={(e) => setLicenseBaseCost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost Per User ($/month)</label>
                <input
                  type="number"
                  value={licenseCostPerUser}
                  onChange={(e) => setLicenseCostPerUser(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Users</label>
                <input
                  type="number"
                  value={licenseUsers}
                  onChange={(e) => setLicenseUsers(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Ongoing Maintenance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Ongoing Maintenance</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Annual Hours</label>
                <input
                  type="number"
                  value={annualMaintenanceHours}
                  onChange={(e) => setAnnualMaintenanceHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blended Rate ($/hour)</label>
                <input
                  type="number"
                  value={maintenanceRate}
                  onChange={(e) => setMaintenanceRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Resources */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Implementation Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">Internal Resources</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blended Rate ($/hour)</label>
                <input
                  type="number"
                  value={internalRate}
                  onChange={(e) => setInternalRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                <input
                  type="number"
                  value={internalHours}
                  onChange={(e) => setInternalHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">Vendor Resources</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rate ($/hour)</label>
                <input
                  type="number"
                  value={vendorRate}
                  onChange={(e) => setVendorRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                <input
                  type="number"
                  value={vendorHours}
                  onChange={(e) => setVendorHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Development */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-800">Custom Development</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Configuration Hours</label>
                <input
                  type="number"
                  value={configHours}
                  onChange={(e) => setConfigHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Configuration Rate ($/hour)</label>
                <input
                  type="number"
                  value={configRate}
                  onChange={(e) => setConfigRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Code Hours</label>
                <input
                  type="number"
                  value={codeHours}
                  onChange={(e) => setCodeHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code Rate ($/hour)</label>
                <input
                  type="number"
                  value={codeRate}
                  onChange={(e) => setCodeRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Database Hours</label>
                <input
                  type="number"
                  value={databaseHours}
                  onChange={(e) => setDatabaseHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Database Rate ($/hour)</label>
                <input
                  type="number"
                  value={databaseRate}
                  onChange={(e) => setDatabaseRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Development Hours</label>
                <input
                  type="number"
                  value={apiHours}
                  onChange={(e) => setApiHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Rate ($/hour)</label>
                <input
                  type="number"
                  value={apiRate}
                  onChange={(e) => setApiRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Approval Thresholds */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-800">Approval Thresholds</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">COO Approval Threshold ($)</label>
              <input
                type="number"
                value={cooThreshold}
                onChange={(e) => setCooThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CEO Approval Threshold ($)</label>
              <input
                type="number"
                value={ceoThreshold}
                onChange={(e) => setCeoThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="250000"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className={`bg-gradient-to-br ${colors.gradient} rounded-xl shadow-lg p-8 text-white`}>
          <h2 className="text-2xl font-bold mb-6">Deal Summary: {dealName || 'Unnamed Deal'}</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold">${revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Total Costs</div>
              <div className="text-3xl font-bold">${totalCosts.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm opacity-90 mb-1">Net Profit</div>
              <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                ${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="text-lg mb-2">Return on Risk-Adjusted Capital (RORAC)</div>
            <div className="text-5xl font-bold">{rorac.toFixed(2)}%</div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-3">Cost Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-90">Fees</div>
                <div className="text-xl font-semibold">${feesCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-90">Licensing (over {loanTerm} months)</div>
                <div className="text-xl font-semibold">${licensingCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-90">Implementation</div>
                <div className="text-xl font-semibold">${implementationCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-90">Maintenance ({(parseFloat(loanTerm) / 12).toFixed(1)} years)</div>
                <div className="text-xl font-semibold">${maintenanceCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm opacity-90">Custom Development</div>
                <div className="text-xl font-semibold">${customDevCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <h3 className="text-xl font-semibold mb-3">Approval Requirements</h3>
            <div className="space-y-2">
              {!requiresCOO && !requiresCEO && (
                <div className="flex items-center gap-2 bg-green-500/20 rounded-lg p-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Standard approval process applies</span>
                </div>
              )}
              {requiresCOO && !requiresCEO && (
                <div className="flex items-center gap-2 bg-yellow-500/20 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>COO approval required (Total costs exceed ${parseFloat(cooThreshold).toLocaleString()})</span>
                </div>
              )}
              {requiresCEO && (
                <div className="flex items-center gap-2 bg-red-500/20 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>CEO approval required (Total costs exceed ${parseFloat(ceoThreshold).toLocaleString()})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Assistant Widget */}
      <ChatWidget 
        calculatorContext={{
          totalCosts,
          revenue,
          netProfit,
          rorac,
          cooThreshold,
          ceoThreshold,
          dealName
        }}
      />
    </div>
  );
}
