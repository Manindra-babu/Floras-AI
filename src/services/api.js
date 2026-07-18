import { supabase, isMockMode } from '../supabaseClient'

// Pre-defined high-quality Unsplash image URLs representing different tree species for mock states
const MOCK_SPECIES_PHOTOS = {
  'Coast Redwood (Sequoia sempervirens)': 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&auto=format&fit=crop&q=80',
  'Monterey Cypress (Cupressus macrocarpa)': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=80',
  'London Plane Tree (Platanus x acerifolia)': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&auto=format&fit=crop&q=80',
  'Blue Gum Eucalyptus (Eucalyptus globulus)': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
  'Coast Live Oak (Quercus agrifolia)': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&auto=format&fit=crop&q=80',
  'Ginkgo Biloba (Ginkgo biloba)': 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80',
  'Jacaranda (Jacaranda mimosifolia)': 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600&auto=format&fit=crop&q=80',
  'default': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=80'
}

// Initial mockup trees data centered in Golden Gate Park, SF
const INITIAL_MOCK_TREES = [
  {
    id: 'mock-tree-1',
    species: 'Coast Redwood (Sequoia sempervirens)',
    species_confidence: 0.94,
    latitude: 37.7694,
    longitude: -122.4862,
    current_status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['Coast Redwood (Sequoia sempervirens)'],
    note: 'Tall and majestic. Located near the redwood grove entrance path.',
    reported_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: 'mock-tree-2',
    species: 'Monterey Cypress (Cupressus macrocarpa)',
    species_confidence: 0.88,
    latitude: 37.7682,
    longitude: -122.4821,
    current_status: 'sick',
    photo_url: MOCK_SPECIES_PHOTOS['Monterey Cypress (Cupressus macrocarpa)'],
    note: 'Showing significant branch dieback on the west side. Need to monitor.',
    reported_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
  },
  {
    id: 'mock-tree-3',
    species: 'London Plane Tree (Platanus x acerifolia)',
    species_confidence: 0.91,
    latitude: 37.7725,
    longitude: -122.4795,
    current_status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['London Plane Tree (Platanus x acerifolia)'],
    note: 'Sturdy street tree, provides great shade.',
    reported_by: 'mock-user-user1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  },
  {
    id: 'mock-tree-4',
    species: 'Blue Gum Eucalyptus (Eucalyptus globulus)',
    species_confidence: 0.85,
    latitude: 37.7711,
    longitude: -122.4890,
    current_status: 'cut_down',
    photo_url: MOCK_SPECIES_PHOTOS['Blue Gum Eucalyptus (Eucalyptus globulus)'],
    note: 'Large old eucalyptus. Found completely cut down, stump remaining.',
    reported_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
  },
  {
    id: 'mock-tree-5',
    species: 'Coast Live Oak (Quercus agrifolia)',
    species_confidence: 0.96,
    latitude: 37.7738,
    longitude: -122.4845,
    current_status: 'sick',
    photo_url: MOCK_SPECIES_PHOTOS['Coast Live Oak (Quercus agrifolia)'],
    note: 'Leaves turning brown, signs of sudden oak death symptoms.',
    reported_by: 'mock-user-user2',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
]

const INITIAL_MOCK_HISTORY = [
  // Tree 1 (Redwood)
  {
    id: 'mock-hist-1',
    tree_id: 'mock-tree-1',
    status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['Coast Redwood (Sequoia sempervirens)'],
    note: 'Initial report. Beautiful green needles.',
    updated_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Tree 2 (Cypress)
  {
    id: 'mock-hist-2',
    tree_id: 'mock-tree-2',
    status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['Monterey Cypress (Cupressus macrocarpa)'],
    note: 'Initial report. Looking robust.',
    updated_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-hist-3',
    tree_id: 'mock-tree-2',
    status: 'sick',
    photo_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=80',
    note: 'Marked sick: Heavy wind damage broke multiple limbs and the foliage is drying.',
    updated_by: 'mock-user-user1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Tree 3 (Plane Tree)
  {
    id: 'mock-hist-4',
    tree_id: 'mock-tree-3',
    status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['London Plane Tree (Platanus x acerifolia)'],
    note: 'Initial report. Street side tree.',
    updated_by: 'mock-user-user1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Tree 4 (Eucalyptus)
  {
    id: 'mock-hist-5',
    tree_id: 'mock-tree-4',
    status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['Blue Gum Eucalyptus (Eucalyptus globulus)'],
    note: 'Initial report.',
    updated_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-hist-6',
    tree_id: 'mock-tree-4',
    status: 'sick',
    photo_url: MOCK_SPECIES_PHOTOS['Blue Gum Eucalyptus (Eucalyptus globulus)'],
    note: 'Foliage thinning rapidly.',
    updated_by: 'mock-user-user2',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-hist-7',
    tree_id: 'mock-tree-4',
    status: 'cut_down',
    photo_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&auto=format&fit=crop&q=80',
    note: 'Marked cut down: Tree has been completely cut down by developers.',
    updated_by: 'mock-user-admin',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Tree 5 (Live Oak)
  {
    id: 'mock-hist-8',
    tree_id: 'mock-tree-5',
    status: 'healthy',
    photo_url: MOCK_SPECIES_PHOTOS['Coast Live Oak (Quercus agrifolia)'],
    note: 'Initial report. Beautiful green oak.',
    updated_by: 'mock-user-user2',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-hist-9',
    tree_id: 'mock-tree-5',
    status: 'sick',
    photo_url: MOCK_SPECIES_PHOTOS['Coast Live Oak (Quercus agrifolia)'],
    note: 'Marked sick: Leaves brown, showing oozing sap.',
    updated_by: 'mock-user-user2',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const INITIAL_MOCK_ADOPTIONS = [
  {
    id: 'mock-adopt-1',
    tree_id: 'mock-tree-2',
    user_id: 'mock-user-admin',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-adopt-2',
    tree_id: 'mock-tree-5',
    user_id: 'mock-user-admin',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// LocalStorage Database initialization
const getMockDB = () => {
  const db = localStorage.getItem('tree_census_db')
  if (!db) {
    const newDb = {
      trees: INITIAL_MOCK_TREES,
      status_history: INITIAL_MOCK_HISTORY,
      adoptions: INITIAL_MOCK_ADOPTIONS,
      confirmations: [
        { id: 'mock-conf-1', tree_id: 'mock-tree-1', status_confirmed: 'healthy', confirmed_by: 'mock-user-user1', created_at: new Date().toISOString() },
        { id: 'mock-conf-2', tree_id: 'mock-tree-1', status_confirmed: 'healthy', confirmed_by: 'mock-user-user2', created_at: new Date().toISOString() }
      ],
      profiles: [
        { id: 'mock-user-admin', display_name: 'City Canopy Admin', created_at: new Date().toISOString() },
        { id: 'mock-user-user1', display_name: 'Eco Stewardship Team', created_at: new Date().toISOString() },
        { id: 'mock-user-user2', display_name: 'Canopy Patrol Officer', created_at: new Date().toISOString() }
      ]
    }
    // Set tree-1 to verified
    newDb.trees[0].verified = true
    localStorage.setItem('tree_census_db', JSON.stringify(newDb))
    return newDb
  }
  
  const parsed = JSON.parse(db)
  let updated = false
  if (!parsed.confirmations) {
    parsed.confirmations = [
      { id: 'mock-conf-1', tree_id: 'mock-tree-1', status_confirmed: 'healthy', confirmed_by: 'mock-user-user1', created_at: new Date().toISOString() },
      { id: 'mock-conf-2', tree_id: 'mock-tree-1', status_confirmed: 'healthy', confirmed_by: 'mock-user-user2', created_at: new Date().toISOString() }
    ]
    parsed.trees[0].verified = true
    updated = true
  }
  if (!parsed.profiles) {
    parsed.profiles = [
      { id: 'mock-user-admin', display_name: 'City Canopy Admin', created_at: new Date().toISOString() },
      { id: 'mock-user-user1', display_name: 'Eco Stewardship Team', created_at: new Date().toISOString() },
      { id: 'mock-user-user2', display_name: 'Canopy Patrol Officer', created_at: new Date().toISOString() }
    ]
    updated = true
  }
  // Ensure default trees have verified property
  parsed.trees.forEach(t => {
    if (t.verified === undefined) {
      t.verified = t.id === 'mock-tree-1' ? true : false
      updated = true
    }
  })
  if (updated) {
    localStorage.setItem('tree_census_db', JSON.stringify(parsed))
  }
  return parsed
}

const saveMockDB = (db) => {
  localStorage.setItem('tree_census_db', JSON.stringify(db))
}

export const api = {
  // 1. REVERSE GEOCODING
  reverseGeocode: async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'FlorasAI/1.0 (contact: florasai@example.com)'
          }
        }
      )
      if (!response.ok) throw new Error('Geocoding service error')
      const data = await response.json()
      return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }
  },

  // 2. PLANTNET IDENTIFICATION
  identifySpecies: async (photoFile) => {
    const apiKey = import.meta.env.VITE_PLANTNET_API_KEY
    const isMockApiKey = !apiKey || apiKey.includes('your-plantnet-api')

    if (isMockApiKey) {
      // Simulate network latency for mock identification
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Try to match file name keywords to return a realistic mock, otherwise select randomly
      const name = photoFile.name.toLowerCase()
      let species = 'Coast Live Oak (Quercus agrifolia)'
      let score = 0.89

      if (name.includes('redwood') || name.includes('sequoia')) {
        species = 'Coast Redwood (Sequoia sempervirens)'
        score = 0.95
      } else if (name.includes('cypress') || name.includes('cupressus')) {
        species = 'Monterey Cypress (Cupressus macrocarpa)'
        score = 0.91
      } else if (name.includes('oak') || name.includes('quercus')) {
        species = 'Coast Live Oak (Quercus agrifolia)'
        score = 0.94
      } else if (name.includes('plane') || name.includes('platanus')) {
        species = 'London Plane Tree (Platanus x acerifolia)'
        score = 0.88
      } else if (name.includes('eucalyptus')) {
        species = 'Blue Gum Eucalyptus (Eucalyptus globulus)'
        score = 0.87
      } else if (name.includes('ginkgo')) {
        species = 'Ginkgo Biloba (Ginkgo biloba)'
        score = 0.92
      } else if (name.includes('jacaranda')) {
        species = 'Jacaranda (Jacaranda mimosifolia)'
        score = 0.96
      } else {
        // Randomly pick a mock tree species
        const list = Object.keys(MOCK_SPECIES_PHOTOS).filter(k => k !== 'default')
        species = list[Math.floor(Math.random() * list.length)]
        score = parseFloat((0.75 + Math.random() * 0.23).toFixed(2))
      }

      return {
        species,
        score
      }
    }

    // Live API Call
    try {
      const formData = new FormData()
      formData.append('images', photoFile)
      formData.append('organs', 'auto')

      const response = await fetch(
        `/api/plantnet/v2/identify/all?api-key=${apiKey}`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        const errorMsg = await response.text().catch(() => '')
        console.error(`PlantNet API Error: ${response.status} ${response.statusText}`, errorMsg)
        throw new Error(`PlantNet API identification failed (Status: ${response.status})`)
      }

      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0]
        const speciesCommon = topResult.species.commonNames?.[0] || ''
        const speciesScientific = topResult.species.scientificNameWithoutAuthor || ''
        const speciesLabel = speciesCommon 
          ? `${speciesCommon} (${speciesScientific})`
          : speciesScientific

        return {
          species: speciesLabel,
          score: topResult.score
        }
      } else {
        throw new Error('No species recognized by PlantNet')
      }
    } catch (error) {
      console.error('PlantNet API error:', error)
      throw error // Let UI handle error and fall back to manual input
    }
  },

  // 3. STATS
  getStats: async () => {
    if (isMockMode) {
      const db = getMockDB()
      const treesCount = db.trees.length
      
      const sickCount = db.trees.filter(t => t.current_status === 'sick').length
      const cutCount = db.trees.filter(t => t.current_status === 'cut_down').length
      
      const complaintsSent = db.status_history.filter(h => h.status === 'sick' || h.status === 'cut_down').length + 8 // offset for realistic stats
      const verifiedCount = db.trees.filter(t => t.verified).length
      const verifiedPct = treesCount > 0 ? Math.round((verifiedCount / treesCount) * 100) : 0

      return {
        totalTrees: treesCount,
        sickTrees: sickCount,
        cutDownTrees: cutCount,
        alertsSent: complaintsSent,
        verifiedPercentage: verifiedPct
      }
    }

    // Live Supabase API
    try {
      const { count: totalTrees } = await supabase
        .from('trees')
        .select('*', { count: 'exact', head: true })

      const { count: sickTrees } = await supabase
        .from('trees')
        .select('*', { count: 'exact', head: true })
        .eq('current_status', 'sick')

      const { count: cutDownTrees } = await supabase
        .from('trees')
        .select('*', { count: 'exact', head: true })
        .eq('current_status', 'cut_down')

      const { count: alertsSent } = await supabase
        .from('tree_status_history')
        .select('*', { count: 'exact', head: true })
        .in('status', ['sick', 'cut_down'])

      const { count: verifiedTrees } = await supabase
        .from('trees')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true)

      const verifiedPct = totalTrees > 0 ? Math.round(((verifiedTrees || 0) / totalTrees) * 100) : 0

      return {
        totalTrees: totalTrees || 0,
        sickTrees: sickTrees || 0,
        cutDownTrees: cutDownTrees || 0,
        alertsSent: (alertsSent || 0) + 8, // demo offset
        verifiedPercentage: verifiedPct
      }
    } catch (e) {
      console.error('Error fetching Supabase stats:', e)
      return { totalTrees: 0, sickTrees: 0, cutDownTrees: 0, alertsSent: 0, verifiedPercentage: 0 }
    }
  },

  // 4. GET ALL TREES
  getTrees: async () => {
    if (isMockMode) {
      const db = getMockDB()
      return [...db.trees].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (e) {
      console.error('Error fetching trees:', e)
      return []
    }
  },

  // 5. GET TREE DETAILS WITH HISTORY AND ADOPTIONS
  getTreeDetails: async (treeId) => {
    if (isMockMode) {
      const db = getMockDB()
      const tree = db.trees.find(t => t.id === treeId)
      if (!tree) throw new Error('Tree not found')

      const history = db.status_history
        .filter(h => h.tree_id === treeId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

      const adoptions = db.adoptions.filter(a => a.tree_id === treeId)
      const confirmations = db.confirmations.filter(c => c.tree_id === treeId)

      return {
        tree,
        history,
        adoptions,
        confirmations
      }
    }

    try {
      const { data: tree, error: treeErr } = await supabase
        .from('trees')
        .select('*')
        .eq('id', treeId)
        .single()

      if (treeErr) throw treeErr

      const { data: history, error: histErr } = await supabase
        .from('tree_status_history')
        .select('*')
        .eq('tree_id', treeId)
        .order('created_at', { ascending: true })

      if (histErr) throw histErr

      const { data: adoptions, error: adoptErr } = await supabase
        .from('tree_adoptions')
        .select('*')
        .eq('tree_id', treeId)

      if (adoptErr) throw adoptErr

      const { data: confirmations, error: confErr } = await supabase
        .from('tree_confirmations')
        .select('*')
        .eq('tree_id', treeId)

      if (confErr) throw confErr

      return {
        tree,
        history: history || [],
        adoptions: adoptions || [],
        confirmations: confirmations || []
      }
    } catch (e) {
      console.error('Error fetching tree details:', e)
      throw e
    }
  },

  // 6. REPORT A TREE (CREATE)
  createTree: async ({ species, species_confidence, latitude, longitude, note, photoFile, reported_by }) => {
    let photoUrl = ''

    if (isMockMode) {
      const db = getMockDB()
      
      // If photoFile is provided, generate a temporary object URL, otherwise use a placeholder
      if (photoFile) {
        photoUrl = URL.createObjectURL(photoFile)
      } else {
        photoUrl = MOCK_SPECIES_PHOTOS[species] || MOCK_SPECIES_PHOTOS['default']
      }

      const newTree = {
        id: `tree-${Math.random().toString(36).substring(2, 9)}`,
        species,
        species_confidence: species_confidence || 1.0,
        latitude,
        longitude,
        current_status: 'healthy',
        photo_url: photoUrl,
        note: note || '',
        reported_by: reported_by || 'mock-user-guest',
        created_at: new Date().toISOString()
      }

      const newHistory = {
        id: `hist-${Math.random().toString(36).substring(2, 9)}`,
        tree_id: newTree.id,
        status: 'healthy',
        photo_url: photoUrl,
        note: 'Tree registered as healthy.',
        updated_by: reported_by || 'mock-user-guest',
        created_at: newTree.created_at
      }

      db.trees.push(newTree)
      db.status_history.push(newHistory)
      saveMockDB(db)

      return newTree
    }

    try {
      // 1. Upload Photo to Storage
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `reports/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('tree-photos')
          .upload(filePath, photoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('tree-photos')
          .getPublicUrl(filePath)

        photoUrl = urlData.publicUrl
      } else {
        photoUrl = MOCK_SPECIES_PHOTOS[species] || MOCK_SPECIES_PHOTOS['default']
      }

      // 2. Insert Tree Record
      const { data: tree, error: treeError } = await supabase
        .from('trees')
        .insert([{
          species,
          species_confidence: species_confidence || 1.0,
          latitude,
          longitude,
          current_status: 'healthy',
          photo_url: photoUrl,
          note: note || '',
          reported_by
        }])
        .select()
        .single()

      if (treeError) throw treeError

      // 3. Insert Initial History Log
      const { error: historyError } = await supabase
        .from('tree_status_history')
        .insert([{
          tree_id: tree.id,
          status: 'healthy',
          photo_url: photoUrl,
          note: 'Tree registered as healthy.',
          updated_by: reported_by
        }])

      if (historyError) throw historyError

      return tree
    } catch (e) {
      console.error('Error in createTree:', e)
      throw e
    }
  },

  // 7. UPDATE TREE STATUS
  updateTreeStatus: async (treeId, { status, note, photoFile, updated_by }) => {
    let photoUrl = ''

    if (isMockMode) {
      const db = getMockDB()
      const treeIndex = db.trees.findIndex(t => t.id === treeId)
      if (treeIndex === -1) throw new Error('Tree not found')

      if (photoFile) {
        photoUrl = URL.createObjectURL(photoFile)
      } else {
        // Carry over old photo url if no new photo provided
        photoUrl = db.trees[treeIndex].photo_url
      }

      // Update tree current status
      db.trees[treeIndex].current_status = status
      if (photoFile) {
        db.trees[treeIndex].photo_url = photoUrl
      }

      // Create history entry
      const newHistory = {
        id: `hist-${Math.random().toString(36).substring(2, 9)}`,
        tree_id: treeId,
        status,
        photo_url: photoUrl,
        note: note || `Status updated to ${status}.`,
        updated_by: updated_by || 'mock-user-guest',
        created_at: new Date().toISOString()
      }

      db.status_history.push(newHistory)
      saveMockDB(db)

      return db.trees[treeIndex]
    }

    try {
      // 1. Upload new photo if supplied
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `updates/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('tree-photos')
          .upload(filePath, photoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('tree-photos')
          .getPublicUrl(filePath)

        photoUrl = urlData.publicUrl
      }

      // 2. Update status in trees table
      const updatePayload = { current_status: status }
      if (photoUrl) {
        updatePayload.photo_url = photoUrl
      }

      const { data: tree, error: treeError } = await supabase
        .from('trees')
        .update(updatePayload)
        .eq('id', treeId)
        .select()
        .single()

      if (treeError) throw treeError

      // Fetch the last known photo if no new photo was uploaded
      const finalPhotoUrl = photoUrl || tree.photo_url

      // 3. Append to history log
      const { error: historyError } = await supabase
        .from('tree_status_history')
        .insert([{
          tree_id: treeId,
          status,
          photo_url: finalPhotoUrl,
          note: note || `Status updated to ${status}.`,
          updated_by
        }])

      if (historyError) throw historyError

      return tree
    } catch (e) {
      console.error('Error in updateTreeStatus:', e)
      throw e
    }
  },

  // 8. ADOPT TREE
  adoptTree: async (treeId, userId) => {
    if (isMockMode) {
      const db = getMockDB()
      // Check if already adopted
      const exists = db.adoptions.some(a => a.tree_id === treeId && a.user_id === userId)
      if (exists) return

      const newAdoption = {
        id: `adopt-${Math.random().toString(36).substring(2, 9)}`,
        tree_id: treeId,
        user_id: userId,
        created_at: new Date().toISOString()
      }

      db.adoptions.push(newAdoption)
      saveMockDB(db)
      return newAdoption
    }

    try {
      const { data, error } = await supabase
        .from('tree_adoptions')
        .insert([{ tree_id: treeId, user_id: userId }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (e) {
      console.error('Error adopting tree:', e)
      throw e
    }
  },

  // 9. UNADOPT TREE
  unadoptTree: async (treeId, userId) => {
    if (isMockMode) {
      const db = getMockDB()
      db.adoptions = db.adoptions.filter(a => !(a.tree_id === treeId && a.user_id === userId))
      saveMockDB(db)
      return
    }

    try {
      const { error } = await supabase
        .from('tree_adoptions')
        .delete()
        .eq('tree_id', treeId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (e) {
      console.error('Error removing adoption:', e)
      throw e
    }
  },

  // 10. GET ADOPTED TREES BY USER
  getAdoptedTrees: async (userId) => {
    if (isMockMode) {
      const db = getMockDB()
      const adoptedIds = db.adoptions.filter(a => a.user_id === userId).map(a => a.tree_id)
      return db.trees.filter(t => adoptedIds.includes(t.id))
    }

    try {
      const { data, error } = await supabase
        .from('tree_adoptions')
        .select('tree_id, trees(*)')
        .eq('user_id', userId)

      if (error) throw error
      // Extract trees and filter nulls
      return data.map(item => item.trees).filter(Boolean)
    } catch (e) {
      console.error('Error fetching adopted trees:', e)
      return []
    }
  },

  // 11. CONFIRM TREE STATUS (VERIFICATION)
  confirmTreeStatus: async (treeId, status, userId) => {
    if (isMockMode) {
      const db = getMockDB()
      // Check if already confirmed
      const exists = db.confirmations.some(
        c => c.tree_id === treeId && c.status_confirmed === status && c.confirmed_by === userId
      )
      if (exists) throw new Error('You have already confirmed this status.')

      const newConf = {
        id: `conf-${Math.random().toString(36).substring(2, 9)}`,
        tree_id: treeId,
        status_confirmed: status,
        confirmed_by: userId,
        created_at: new Date().toISOString()
      }
      db.confirmations.push(newConf)

      // Count confirmations for current status
      const tree = db.trees.find(t => t.id === treeId)
      if (tree && tree.current_status === status) {
        const confCount = db.confirmations.filter(
          c => c.tree_id === treeId && c.status_confirmed === status
        ).length
        if (confCount >= 2) {
          tree.verified = true
        }
      }
      saveMockDB(db)
      return newConf
    }

    try {
      const { data, error } = await supabase
        .from('tree_confirmations')
        .insert([{ tree_id: treeId, status_confirmed: status, confirmed_by: userId }])
        .select()
        .single()

      if (error) {
        if (error.code === '23505') throw new Error('You have already confirmed this status.')
        throw error
      }

      // Check verification count
      const { count, error: countErr } = await supabase
        .from('tree_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('tree_id', treeId)
        .eq('status_confirmed', status)

      if (countErr) throw countErr

      if (count && count >= 2) {
        await supabase
          .from('trees')
          .update({ verified: true })
          .eq('id', treeId)
      }

      return data
    } catch (e) {
      console.error('Error confirming status:', e)
      throw e
    }
  },

  // 12. GET LEADERBOARD (MONTHLY & ALL TIME)
  getLeaderboard: async (period) => {
    if (isMockMode) {
      const db = getMockDB()
      const now = new Date()
      const cutoff = period === 'month' ? new Date(now.setDate(now.getDate() - 30)) : null

      const leaderboard = db.profiles.map(p => {
        let userTrees = db.trees.filter(t => t.reported_by === p.id)
        let userUpdates = db.status_history.filter(h => h.updated_by === p.id)
        let userAdoptions = db.adoptions.filter(a => a.user_id === p.id)

        if (cutoff) {
          userTrees = userTrees.filter(t => new Date(t.created_at) >= cutoff)
          userUpdates = userUpdates.filter(h => new Date(h.created_at) >= cutoff)
          userAdoptions = userAdoptions.filter(a => new Date(a.created_at) >= cutoff)
        }

        const reports = userTrees.length
        const statusUpdates = userUpdates.length
        const adoptionsCount = userAdoptions.length
        const impactScore = (reports * 3) + (statusUpdates * 2) + (adoptionsCount * 1)

        let topContribution = 'None'
        if (reports >= statusUpdates && reports >= adoptionsCount && reports > 0) topContribution = 'Reporter'
        else if (statusUpdates >= reports && statusUpdates >= adoptionsCount && statusUpdates > 0) topContribution = 'Updater'
        else if (adoptionsCount > 0) topContribution = 'Adopter'

        return {
          userId: p.id,
          displayName: p.display_name,
          reports,
          statusUpdates,
          adoptions: adoptionsCount,
          impactScore,
          topContribution
        }
      })

      return leaderboard.sort((a, b) => b.impactScore - a.impactScore)
    }

    try {
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*')
      if (pErr) throw pErr

      const { data: trees, error: tErr } = await supabase.from('trees').select('reported_by, created_at')
      if (tErr) throw tErr

      const { data: history, error: hErr } = await supabase.from('tree_status_history').select('updated_by, created_at')
      if (hErr) throw hErr

      const { data: adoptions, error: aErr } = await supabase.from('tree_adoptions').select('user_id, created_at')
      if (aErr) throw aErr

      const now = new Date()
      const cutoff = period === 'month' ? new Date(now.setDate(now.getDate() - 30)) : null

      const leaderboard = (profiles || []).map(p => {
        let uTrees = (trees || []).filter(t => t.reported_by === p.id)
        let uUpdates = (history || []).filter(h => h.updated_by === p.id)
        let uAdoptions = (adoptions || []).filter(a => a.user_id === p.id)

        if (cutoff) {
          uTrees = uTrees.filter(t => new Date(t.created_at) >= cutoff)
          uUpdates = uUpdates.filter(h => new Date(h.created_at) >= cutoff)
          uAdoptions = uAdoptions.filter(a => new Date(a.created_at) >= cutoff)
        }

        const reports = uTrees.length
        const statusUpdates = uUpdates.length
        const adoptionsCount = uAdoptions.length
        const impactScore = (reports * 3) + (statusUpdates * 2) + (adoptionsCount * 1)

        let topContribution = 'None'
        if (reports >= statusUpdates && reports >= adoptionsCount && reports > 0) topContribution = 'Reporter'
        else if (statusUpdates >= reports && statusUpdates >= adoptionsCount && statusUpdates > 0) topContribution = 'Updater'
        else if (adoptionsCount > 0) topContribution = 'Adopter'

        return {
          userId: p.id,
          displayName: p.display_name,
          reports,
          statusUpdates,
          adoptions: adoptionsCount,
          impactScore,
          topContribution
        }
      })

      return leaderboard.sort((a, b) => b.impactScore - a.impactScore)
    } catch (e) {
      console.error('Error calculating leaderboard:', e)
      return []
    }
  },

  // 13. GET REPORT DATA FOR AUTHORITIES
  getAuthorityReportData: async (areaText, startDate, endDate, statusFilter) => {
    if (isMockMode) {
      const db = getMockDB()
      let filtered = [...db.trees]

      if (areaText) {
        const term = areaText.toLowerCase()
        filtered = filtered.filter(t => t.note && t.note.toLowerCase().includes(term))
      }

      if (startDate) {
        const start = new Date(startDate)
        filtered = filtered.filter(t => new Date(t.created_at) >= start)
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        filtered = filtered.filter(t => new Date(t.created_at) <= end)
      }

      if (statusFilter && statusFilter.length > 0) {
        filtered = filtered.filter(t => statusFilter.includes(t.current_status))
      } else {
        filtered = filtered.filter(t => t.current_status === 'sick' || t.current_status === 'cut_down')
      }

      return filtered.map(t => {
        const reporterProfile = db.profiles.find(p => p.id === t.reported_by)
        const reporterName = reporterProfile ? reporterProfile.display_name : 'Citizen Scientist'

        const treeHistory = db.status_history
          .filter(h => h.tree_id === t.id)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        const latestLog = treeHistory[0]

        return {
          ...t,
          reported_by_name: reporterName,
          last_updated_at: latestLog ? latestLog.created_at : t.created_at,
          latest_note: latestLog ? latestLog.note : t.note
        }
      })
    }

    try {
      let query = supabase.from('trees').select('*')

      if (statusFilter && statusFilter.length > 0) {
        query = query.in('current_status', statusFilter)
      } else {
        query = query.in('current_status', ['sick', 'cut_down'])
      }

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setDate(end.getDate() + 1)
        query = query.lte('created_at', end.toISOString())
      }

      const { data: trees, error } = await query
      if (error) throw error

      let result = trees || []

      if (areaText) {
        const term = areaText.toLowerCase()
        result = result.filter(
          t => (t.note && t.note.toLowerCase().includes(term)) || (t.species && t.species.toLowerCase().includes(term))
        )
      }

      const { data: profiles } = await supabase.from('profiles').select('*')
      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p.display_name }), {})

      const finalTrees = await Promise.all(
        result.map(async t => {
          const { data: history } = await supabase
            .from('tree_status_history')
            .select('*')
            .eq('tree_id', t.id)
            .order('created_at', { ascending: false })
            .limit(1)

          const latestLog = history && history.length > 0 ? history[0] : null

          return {
            ...t,
            reported_by_name: profileMap[t.reported_by] || 'Citizen Scientist',
            last_updated_at: latestLog ? latestLog.created_at : t.created_at,
            latest_note: latestLog ? latestLog.note : t.note
          }
        })
      )

      return finalTrees
    } catch (e) {
      console.error('Error fetching authority report data:', e)
      return []
    }
  },

  // 14. SAVE USER PROFILE
  saveUserProfile: async (userId, displayName) => {
    if (isMockMode) {
      const db = getMockDB()
      const exists = db.profiles.some(p => p.id === userId)
      if (!exists) {
        db.profiles.push({
          id: userId,
          display_name: displayName,
          created_at: new Date().toISOString()
        })
        saveMockDB(db)
      }
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ id: userId, display_name: displayName }])
      if (error) throw error
    } catch (e) {
      console.error('Error saving user profile:', e)
    }
  }
}
