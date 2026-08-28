import os

with open('src/components/ResultsView.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''                </div>
              );
            })}
          </div>
        </div>'''

replacement = '''                </div>
              );
            })}

            {unmatchedAnswers.length > 0 && (
              <div className="mt-8 mb-4">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Unmatched Answers <span className="text-gray-500 font-normal text-sm ml-2">(Found on sheet but no matching question)</span></h3>
                <div className="space-y-4">
                  {unmatchedAnswers.map((ans: any) => {
                    const isSelected = selectedQuestionId === ans.id;
                    return (
                      <div 
                        key={ans.id} 
                        onClick={() => setSelectedQuestionId(ans.id)}
                        className={`border rounded-xl cursor-pointer transition ${isSelected ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className="p-4 flex gap-4 items-start">
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-white ${isSelected ? 'bg-orange-500' : 'bg-gray-600'}`}>
                            {ans.question_number || '?'}
                          </div>
                          <div className="flex-1 text-sm text-gray-700 leading-relaxed pt-1">
                            {ans.text}
                          </div>
                          <div className="flex items-center gap-4 shrink-0 pt-1">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-bold shadow-sm border border-gray-200">Not Graded</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>'''

if target in code:
    with open('src/components/ResultsView.tsx', 'w', encoding='utf-8') as f:
        f.write(code.replace(target, replacement))
    print('SUCCESS')
else:
    print('FAILED')
