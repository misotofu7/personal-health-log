'use client' 

const initialPainLocations = [
    { id: 0, genre: 'Hand', selected: false},
    { id: 1, genre: 'Head', selected: false},
    { id: 2, genre: 'Leg', selected: false},
    { id: 3, genre: 'Foot', selected: false},
    { id: 4, genre: 'Knees', selected: false},

]

export const Popup = () => {
    const [painLocations, setPainLocations] = useState(initialPainLocations); 
    const [userPainLocations, setUserPainLocations] = useState(initialPainLocations);

    const toggleSelection = (id) => {

        setPainLocations(prev => {
            const updated = prev.map(tag =>
            tag.id === id ? { ...tag, selected: !tag.selected } : tag
            );
            setUserPainLocations(updated.filter(tag => tag.selected));
            return updated;
        });
    };

    return(
    <>
             <h4>Pain Tags</h4>

               <div style={{ display: 'inline-flex', gap: '8px' }}>
                {painLocations.map(location => (
                    <div key={location.id}>
                        <button 
                        className={`button ${jobTag.selected ? 'clicked' : ''}`}
                        onClick={() => {
                        /*setUserJobTags(userJobTags.filter(a => //important: set the USER JOB TAG ARRAY, NOT the rendered one.
                            a.id !== jobTag.id
                            )
                        );*/
                        {toggleSelection(location.id)}

                        } }>
                        {location.genre} 
                        </button> 
                    </div>
                    
                ))}
                </div>

    </>
    )

}