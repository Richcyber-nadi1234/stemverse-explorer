
import React, { useState } from 'react';
import { FileDown, Printer, Loader2, FileSpreadsheet, ChevronRight, ChevronLeft, Check, FileText, Calendar, Users, BarChart, X, ClipboardCheck, Sliders } from 'lucide-react';
import { Report } from '../types';

const REPORT_TYPES = [
  { id: 'term_report', title: "Student Term Report", type: 'academic', icon: FileText, description: "Detailed academic performance per student." },
  { id: 'class_summary', title: "Class Performance Summary", type: 'academic', icon: BarChart, description: "Aggregated grades and averages by subject." },
  { id: 'attendance', title: "Attendance Report", type: 'admin', icon: Calendar, description: "Daily or monthly attendance logs." },
  { id: 'exam_analytics', title: "Exam Analytics", type: 'academic', icon: Printer, description: "Item analysis and difficulty distribution." },
  { id: 'transcript', title: "Official Transcript", type: 'academic', icon: FileText, description: "Cumulative record for university applications." },
  { id: 'finance', title: "Financial Report", type: 'admin', icon: FileSpreadsheet, description: "Fee collection and outstanding balances." }
];

export const Reports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);

  const [selectedReport, setSelectedReport] = useState<typeof REPORT_TYPES[0] | null>(null);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    term: 'Term 3, 2023/24',
    classId: 'Class 5A',
    subject: 'All Subjects',
    examId: '',
    dateRange: { start: '', end: '' },
    format: 'PDF',
    includeCharts: true,
    officialSeal: false,
    anonymize: false,
    deliveryMethod: 'download'
  });

  const handleOpenWizard = (report: typeof REPORT_TYPES[0]) => {
    setSelectedReport(report);
    setStep(1);
    setConfig(prev => ({ 
      ...prev, 
      format: ['class_summary', 'finance'].includes(report.id) ? 'XLSX' : 'PDF',
      includeCharts: true,
      dateRange: { start: '', end: '' },
      examId: ''
    }));
  };

  const handleCloseWizard = () => {
    setSelectedReport(null);
    setIsGenerating(false);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedReport?.title || 'Report',
        status: 'ready',
        generated_at: new Date().toISOString(),
        file_url: '#'
      };
      setGeneratedReports([newReport, ...generatedReports]);
      setIsGenerating(false);
      handleCloseWizard();
    }, 2000);
  };

  const canProceed = () => {
    if (step === 1) {
        if (selectedReport?.id === 'attendance') {
            return config.dateRange.start && config.dateRange.end;
        }
        if (selectedReport?.id === 'exam_analytics') {
            return config.examId !== '';
        }
    }
    return true;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reporting & Exports</h1>
          <p className="text-slate-500">Generate official documents, transcripts, and analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report) => (
          <button 
            key={report.id} 
            onClick={() => handleOpenWizard(report)}
            className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left flex flex-col h-full relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${report.type === 'academic' ? 'from-indigo-50 to-indigo-100' : 'from-emerald-50 to-emerald-100'} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`} />
            
            <div className="flex items-start justify-between w-full mb-4 relative z-10">
              <div className={`p-3 rounded-lg ${report.type === 'academic' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 relative z-10">{report.title}</h3>
            <p className="text-sm text-slate-500 relative z-10">{report.description}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Recently Generated</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {generatedReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <FileDown className="w-12 h-12 mb-3 opacity-20" />
              <p>No reports generated in this session.</p>
            </div>
          ) : (
            generatedReports.map((report) => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-100">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{report.type}</p>
                    <p className="text-xs text-slate-500">
                      Generated: {new Date(report.generated_at).toLocaleTimeString()} • Ready
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors">
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Multi-step Wizard */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedReport.type === 'academic' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <selectedReport.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{selectedReport.title}</h3>
                    <p className="text-xs text-slate-500">Configuration Wizard</p>
                  </div>
              </div>
              <button onClick={handleCloseWizard} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                  <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-12 py-4 bg-white border-b border-slate-100">
                {['Parameters', 'Format', 'Review'].map((label, index) => {
                    const stepNum = index + 1;
                    const isActive = step === stepNum;
                    const isCompleted = step > stepNum;
                    return (
                        <div key={label} className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
                                isCompleted ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                            </div>
                            <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
                        </div>
                    );
                })}
                {/* Progress Bar Line */}
                <div className="absolute top-8 left-0 w-full h-0.5 bg-slate-100 -z-0 px-16">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-300" 
                        style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} 
                    />
                </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              
              {/* STEP 1: PARAMETERS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start">
                      <Sliders className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-indigo-900">Please configure the data scope for this report.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Academic Term</label>
                        <select 
                        value={config.term}
                        onChange={(e) => setConfig({...config, term: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-colors font-medium text-slate-700"
                        >
                        <option>Term 3, 2023/24</option>
                        <option>Term 2, 2023/24</option>
                        <option>Term 1, 2023/24</option>
                        </select>
                    </div>

                    {['term_report', 'class_summary', 'attendance', 'exam_analytics'].includes(selectedReport.id) && (
                        <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Class</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Class 5A', 'Class 5B', 'Class 6A'].map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => setConfig({...config, classId: cls})}
                                    className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all ${
                                        config.classId === cls 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                        </div>
                    )}

                    {selectedReport.id === 'exam_analytics' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Exam Reference ID</label>
                            <input 
                                value={config.examId}
                                onChange={(e) => setConfig({...config, examId: e.target.value})}
                                placeholder="e.g. MATH-MID-T3"
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            />
                        </div>
                    )}

                    {selectedReport.id === 'attendance' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                                <input 
                                    type="date"
                                    value={config.dateRange.start}
                                    onChange={(e) => setConfig({...config, dateRange: { ...config.dateRange, start: e.target.value }})}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                                <input 
                                    type="date"
                                    value={config.dateRange.end}
                                    onChange={(e) => setConfig({...config, dateRange: { ...config.dateRange, end: e.target.value }})}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                                />
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: FORMAT */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Output Format</label>
                       <div className="grid grid-cols-3 gap-4">
                          {['PDF', 'XLSX', 'CSV'].map(fmt => (
                            <button 
                                key={fmt}
                                onClick={() => setConfig({...config, format: fmt})}
                                className={`p-4 border-2 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all ${
                                    config.format === fmt 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                                    : 'border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <FileText className={`w-8 h-8 mb-2 ${config.format === fmt ? 'text-indigo-600' : 'text-slate-300'}`} />
                                <span className="font-bold text-sm">{fmt}</span>
                            </button>
                          ))}
                       </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-slate-100">
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                          <span className="font-medium text-slate-700 group-hover:text-indigo-700">Include Visualization Charts</span>
                          <input 
                            type="checkbox" 
                            checked={config.includeCharts}
                            onChange={(e) => setConfig({...config, includeCharts: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                          />
                      </label>
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                          <span className="font-medium text-slate-700 group-hover:text-indigo-700">Add Official School Seal</span>
                          <input 
                            type="checkbox" 
                            checked={config.officialSeal}
                            onChange={(e) => setConfig({...config, officialSeal: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                          />
                      </label>
                      <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                          <span className="font-medium text-slate-700 group-hover:text-indigo-700">Anonymize Data (Privacy Mode)</span>
                          <input 
                            type="checkbox" 
                            checked={config.anonymize}
                            onChange={(e) => setConfig({...config, anonymize: e.target.checked})}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                          />
                      </label>
                   </div>
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {step === 3 && (
                <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-4 shadow-inner">
                        <ClipboardCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Ready to Generate</h3>
                        <p className="text-slate-500">Review your settings before proceeding.</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-5 text-left text-sm space-y-3 border border-slate-200">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <span className="text-slate-500">Report Type</span>
                            <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">{selectedReport.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Format</span>
                            <span className="font-bold text-slate-900">{config.format}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Scope</span>
                            <span className="font-bold text-slate-900">{config.classId} • {config.term}</span>
                        </div>
                        {config.dateRange.start && (
                             <div className="flex justify-between">
                                <span className="text-slate-500">Dates</span>
                                <span className="font-bold text-slate-900">{config.dateRange.start} to {config.dateRange.end}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-slate-200 text-xs">
                            <span className="text-slate-500">Options</span>
                            <span className="text-slate-700">
                                {config.includeCharts && 'Charts, '}
                                {config.officialSeal && 'Seal, '}
                                {config.anonymize && 'Anonymized'}
                            </span>
                        </div>
                    </div>
                </div>
              )}

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
               {step > 1 ? (
                   <button 
                     onClick={() => setStep(step - 1)}
                     className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-white transition-colors flex items-center text-sm"
                   >
                       <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
                   </button>
               ) : (
                   <div></div> 
               )}

               {step < 3 ? (
                   <button 
                     onClick={() => setStep(step + 1)}
                     disabled={!canProceed()}
                     className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                   >
                       Next Step <ChevronRight className="w-4 h-4 ml-1.5" />
                   </button>
               ) : (
                   <button 
                     onClick={handleGenerate}
                     disabled={isGenerating}
                     className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center shadow-lg shadow-green-200 disabled:opacity-70 text-sm"
                   >
                       {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                       Generate Report
                   </button>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
