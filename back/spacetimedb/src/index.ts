import { schema, table, t } from 'spacetimedb/server';

const spacetimedb = schema({
  brand: table(
    {
      public: true,
      indexes: [{ accessor: 'bySector', algorithm: 'btree', columns: ['sector'] }],
    },
    {
      identity: t.identity().primaryKey(),
      name: t.string(),
      email: t.string(),
      logoUrl: t.string(),
      sector: t.string(),
      budget: t.u64(),
      isOnline: t.bool(),
    }
  ),

  club: table(
    {
      public: true,
      indexes: [
        { accessor: 'bySport', algorithm: 'btree', columns: ['sport'] },
        { accessor: 'byLocation', algorithm: 'btree', columns: ['location'] },
      ],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      name: t.string(),
      sport: t.string(),
      location: t.string(),
      logoUrl: t.string(),
      bannerUrl: t.string(),
      description: t.string(),
      budgetMin: t.u64(),
      budgetMax: t.u64(),
      audienceAge: t.string(),
      audienceGender: t.string(),
      website: t.string(),
      foundedYear: t.u32(),
    }
  ),

  clubMetrics: table(
    {
      public: true,
      indexes: [{ accessor: 'byClubId', algorithm: 'btree', columns: ['clubId'] }],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      clubId: t.u64(),
      followers: t.u64(),
      engagementRate: t.f64(),
      reach: t.u64(),
      avgLikes: t.u64(),
      avgComments: t.u64(),
      growthPercent: t.f64(),
      lastUpdated: t.string(),
    }
  ),

  savedSearch: table(
    {
      public: true,
      indexes: [{ accessor: 'byBrandIdentity', algorithm: 'btree', columns: ['brandIdentity'] }],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      brandIdentity: t.identity(),
      name: t.string(),
      filtersJson: t.string(),
      createdAt: t.string(),
    }
  ),

  deal: table(
    {
      public: true,
      indexes: [
        { accessor: 'byBrandIdentity', algorithm: 'btree', columns: ['brandIdentity'] },
        { accessor: 'byClubId', algorithm: 'btree', columns: ['clubId'] },
      ],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      brandIdentity: t.identity(),
      clubId: t.u64(),
      status: t.string(),
      amount: t.u64(),
      title: t.string(),
      description: t.string(),
      startDate: t.string(),
      endDate: t.string(),
      createdAt: t.string(),
    }
  ),

  message: table(
    {
      public: true,
      indexes: [
        { accessor: 'bySenderIdentity', algorithm: 'btree', columns: ['senderIdentity'] },
        { accessor: 'byReceiverIdentity', algorithm: 'btree', columns: ['receiverIdentity'] },
      ],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      senderIdentity: t.identity(),
      receiverIdentity: t.identity(),
      dealId: t.u64(),
      content: t.string(),
      timestamp: t.string(),
      read: t.bool(),
    }
  ),
});

export default spacetimedb;

// --- Lifecycle hooks ---

export const init = spacetimedb.init((ctx) => {
  console.info('SponsorMatch module initialized');
});

export const onConnect = spacetimedb.clientConnected((ctx) => {
  console.info(`Client connected: ${ctx.sender}`);
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  console.info(`Client disconnected: ${ctx.sender}`);
});

// --- Brand Reducers ---

export const registerBrand = spacetimedb.reducer(
  { name: t.string(), email: t.string(), logoUrl: t.string(), sector: t.string(), budget: t.u64() },
  (ctx, { name, email, logoUrl, sector, budget }) => {
    const existing = ctx.db.brand.identity.find(ctx.sender);
    if (existing) {
      ctx.db.brand.identity.update({
        identity: ctx.sender,
        name,
        email,
        logoUrl,
        sector,
        budget,
        isOnline: true,
      });
      return;
    }
    ctx.db.brand.insert({
      identity: ctx.sender,
      name,
      email,
      logoUrl,
      sector,
      budget,
      isOnline: true,
    });
  }
);

// --- Saved Search Reducers ---

export const saveSearch = spacetimedb.reducer(
  { name: t.string(), filtersJson: t.string() },
  (ctx, { name, filtersJson }) => {
    const existing = [...ctx.db.savedSearch.byBrandIdentity.filter(ctx.sender)];
    if (existing.length >= 10) {
      throw new Error('Máximo 10 búsquedas guardadas permitidas');
    }
    ctx.db.savedSearch.insert({
      id: 0n,
      brandIdentity: ctx.sender,
      name,
      filtersJson,
      createdAt: new Date().toISOString(),
    });
  }
);

export const deleteSavedSearch = spacetimedb.reducer(
  { searchId: t.u64() },
  (ctx, { searchId }) => {
    const search = ctx.db.savedSearch.id.find(searchId);
    if (!search) {
      throw new Error('Búsqueda no encontrada');
    }
    if (search.brandIdentity.toHexString() !== ctx.sender.toHexString()) {
      throw new Error('No autorizado');
    }
    ctx.db.savedSearch.id.delete(searchId);
  }
);

// --- Deal Reducers ---

export const createDeal = spacetimedb.reducer(
  {
    clubId: t.u64(),
    amount: t.u64(),
    title: t.string(),
    description: t.string(),
    startDate: t.string(),
    endDate: t.string(),
  },
  (ctx, { clubId, amount, title, description, startDate, endDate }) => {
    const club = ctx.db.club.id.find(clubId);
    if (!club) {
      throw new Error('Club no encontrado');
    }
    ctx.db.deal.insert({
      id: 0n,
      brandIdentity: ctx.sender,
      clubId,
      status: 'pendiente',
      amount,
      title,
      description,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    });
  }
);

export const updateDealStatus = spacetimedb.reducer(
  { dealId: t.u64(), status: t.string() },
  (ctx, { dealId, status }) => {
    const deal = ctx.db.deal.id.find(dealId);
    if (!deal) {
      throw new Error('Acuerdo no encontrado');
    }
    const validStatuses = ['pendiente', 'aceptado', 'rechazado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      throw new Error('Estado inválido');
    }
    ctx.db.deal.id.update({ ...deal, status });
  }
);

// --- Message Reducers ---

export const sendMessage = spacetimedb.reducer(
  { receiverIdentity: t.identity(), dealId: t.u64(), content: t.string() },
  (ctx, { receiverIdentity, dealId, content }) => {
    if (content.trim().length === 0) {
      throw new Error('El mensaje no puede estar vacío');
    }
    ctx.db.message.insert({
      id: 0n,
      senderIdentity: ctx.sender,
      receiverIdentity,
      dealId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }
);

export const markMessageRead = spacetimedb.reducer(
  { messageId: t.u64() },
  (ctx, { messageId }) => {
    const msg = ctx.db.message.id.find(messageId);
    if (!msg) {
      throw new Error('Mensaje no encontrado');
    }
    if (msg.receiverIdentity.toHexString() !== ctx.sender.toHexString()) {
      throw new Error('No autorizado');
    }
    ctx.db.message.id.update({ ...msg, read: true });
  }
);

// --- Seed Data Reducer ---

export const seedData = spacetimedb.reducer((ctx) => {
  const existingClubs = [...ctx.db.club.iter()];
  if (existingClubs.length > 0) {
    console.info('Datos ya existen, omitiendo seed');
    return;
  }

  const clubs = [
    { name: 'Real Madrid CF', sport: 'Fútbol', location: 'Madrid', description: 'Uno de los clubes más laureados del mundo con 15 Champions League.', budgetMin: 500000n, budgetMax: 5000000n, audienceAge: '18-45', audienceGender: 'Mixto', website: 'realmadrid.com', foundedYear: 1902 },
    { name: 'FC Barcelona', sport: 'Fútbol', location: 'Barcelona', description: 'Club emblemático con cantera de élite y audiencia global.', budgetMin: 500000n, budgetMax: 5000000n, audienceAge: '18-45', audienceGender: 'Mixto', website: 'fcbarcelona.com', foundedYear: 1899 },
    { name: 'Atlético de Madrid', sport: 'Fútbol', location: 'Madrid', description: 'Club con identidad fuerte y afición apasionada.', budgetMin: 200000n, budgetMax: 2000000n, audienceAge: '20-50', audienceGender: 'Mixto', website: 'atleticodemadrid.com', foundedYear: 1903 },
    { name: 'Valencia CF', sport: 'Fútbol', location: 'Valencia', description: 'Histórico del fútbol español con gran arraigo local.', budgetMin: 100000n, budgetMax: 1000000n, audienceAge: '18-55', audienceGender: 'Mixto', website: 'valenciacf.com', foundedYear: 1919 },
    { name: 'Real Betis', sport: 'Fútbol', location: 'Sevilla', description: 'Club con una de las aficiones más fieles de España.', budgetMin: 80000n, budgetMax: 800000n, audienceAge: '18-50', audienceGender: 'Mixto', website: 'realbetisbalompie.es', foundedYear: 1907 },
    { name: 'Real Sociedad', sport: 'Fútbol', location: 'San Sebastián', description: 'Club vasco con proyección europea y cantera potente.', budgetMin: 100000n, budgetMax: 900000n, audienceAge: '20-45', audienceGender: 'Mixto', website: 'realsociedad.eus', foundedYear: 1909 },
    { name: 'Club Baloncesto Baskonia', sport: 'Baloncesto', location: 'Vitoria', description: 'Referente de la ACB y la Euroliga con gran tradición.', budgetMin: 50000n, budgetMax: 500000n, audienceAge: '20-50', audienceGender: 'Mixto', website: 'baskonia.com', foundedYear: 1959 },
    { name: 'Real Madrid Baloncesto', sport: 'Baloncesto', location: 'Madrid', description: 'Sección de baloncesto del Real Madrid, el más laureado de Europa.', budgetMin: 200000n, budgetMax: 2000000n, audienceAge: '18-50', audienceGender: 'Mixto', website: 'realmadrid.com', foundedYear: 1931 },
    { name: 'FC Barcelona Basket', sport: 'Baloncesto', location: 'Barcelona', description: 'Sección de baloncesto del Barça con presencia global.', budgetMin: 200000n, budgetMax: 2000000n, audienceAge: '18-50', audienceGender: 'Mixto', website: 'fcbarcelona.com', foundedYear: 1926 },
    { name: 'Club Padel Nuestro', sport: 'Pádel', location: 'Málaga', description: 'Referente del pádel en España con presencia en circuitos WPT.', budgetMin: 20000n, budgetMax: 200000n, audienceAge: '25-55', audienceGender: 'Mixto', website: 'padelnuestro.com', foundedYear: 2010 },
    { name: 'World Padel Tour Academy', sport: 'Pádel', location: 'Madrid', description: 'Academia oficial del World Padel Tour con jugadores de élite.', budgetMin: 30000n, budgetMax: 300000n, audienceAge: '20-45', audienceGender: 'Mixto', website: 'worldpadeltour.com', foundedYear: 2013 },
    { name: 'Club Natació Barcelona', sport: 'Natación', location: 'Barcelona', description: 'Uno de los clubes deportivos más antiguos de España.', budgetMin: 15000n, budgetMax: 150000n, audienceAge: '15-40', audienceGender: 'Mixto', website: 'cnab.cat', foundedYear: 1907 },
    { name: 'Movistar Riders', sport: 'Esports', location: 'Madrid', description: 'Organización líder de esports en España y Latinoamérica.', budgetMin: 50000n, budgetMax: 500000n, audienceAge: '16-35', audienceGender: '70% Masculino', website: 'movistarriders.com', foundedYear: 2017 },
    { name: 'KOI', sport: 'Esports', location: 'Barcelona', description: 'Equipo fundado por Ibai Llanos y Gerard Piqué.', budgetMin: 80000n, budgetMax: 800000n, audienceAge: '14-30', audienceGender: '65% Masculino', website: 'teamkoi.com', foundedYear: 2021 },
    { name: 'UCAM Murcia', sport: 'Baloncesto', location: 'Murcia', description: 'Club universitario con proyección en ACB.', budgetMin: 30000n, budgetMax: 300000n, audienceAge: '18-45', audienceGender: 'Mixto', website: 'ucamdeportes.com', foundedYear: 1985 },
    { name: 'Surf Club Zarautz', sport: 'Surf', location: 'Zarautz', description: 'Club de surf con competidores internacionales y marca lifestyle.', budgetMin: 10000n, budgetMax: 100000n, audienceAge: '18-35', audienceGender: '60% Masculino', website: 'surfclubzarautz.com', foundedYear: 1989 },
    { name: 'USCM Triatlón Madrid', sport: 'Triatlón', location: 'Madrid', description: 'Club de triatlón con atletas en circuitos Ironman.', budgetMin: 10000n, budgetMax: 80000n, audienceAge: '25-50', audienceGender: '55% Masculino', website: 'uscmtriatlon.es', foundedYear: 2005 },
    { name: 'Club Atletismo Playas de Castellón', sport: 'Atletismo', location: 'Castellón', description: 'Referente del atletismo español con medallistas olímpicos.', budgetMin: 20000n, budgetMax: 200000n, audienceAge: '18-45', audienceGender: 'Mixto', website: 'atletismoplayas.com', foundedYear: 1957 },
    { name: 'Real Club de Tenis Barcelona', sport: 'Tenis', location: 'Barcelona', description: 'Sede del Conde de Godó, uno de los torneos ATP más prestigiosos.', budgetMin: 100000n, budgetMax: 1000000n, audienceAge: '25-60', audienceGender: 'Mixto', website: 'rctb1899.es', foundedYear: 1899 },
    { name: 'Atlético Valladolid Rugby', sport: 'Rugby', location: 'Valladolid', description: 'Club de rugby con amplia tradición en la liga nacional.', budgetMin: 10000n, budgetMax: 80000n, audienceAge: '20-45', audienceGender: '65% Masculino', website: 'elvalladolidrugby.com', foundedYear: 1984 },
  ];

  for (const c of clubs) {
    ctx.db.club.insert({
      id: 0n,
      name: c.name,
      sport: c.sport,
      location: c.location,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=2563eb&color=fff&size=128`,
      bannerUrl: '',
      description: c.description,
      budgetMin: c.budgetMin,
      budgetMax: c.budgetMax,
      audienceAge: c.audienceAge,
      audienceGender: c.audienceGender,
      website: c.website,
      foundedYear: c.foundedYear,
    });
  }

  const metricsData = [
    { clubId: 1n, followers: 150000000n, engagementRate: 4.2, reach: 80000000n, avgLikes: 500000n, avgComments: 25000n, growthPercent: 3.5 },
    { clubId: 2n, followers: 120000000n, engagementRate: 4.5, reach: 70000000n, avgLikes: 450000n, avgComments: 22000n, growthPercent: 2.8 },
    { clubId: 3n, followers: 45000000n, engagementRate: 3.8, reach: 25000000n, avgLikes: 180000n, avgComments: 9000n, growthPercent: 4.1 },
    { clubId: 4n, followers: 8000000n, engagementRate: 3.2, reach: 4000000n, avgLikes: 35000n, avgComments: 2000n, growthPercent: 1.5 },
    { clubId: 5n, followers: 6000000n, engagementRate: 5.1, reach: 3500000n, avgLikes: 42000n, avgComments: 3000n, growthPercent: 6.2 },
    { clubId: 6n, followers: 5000000n, engagementRate: 4.0, reach: 2800000n, avgLikes: 28000n, avgComments: 1800n, growthPercent: 3.0 },
    { clubId: 7n, followers: 800000n, engagementRate: 3.5, reach: 400000n, avgLikes: 5000n, avgComments: 400n, growthPercent: 2.0 },
    { clubId: 8n, followers: 25000000n, engagementRate: 3.9, reach: 12000000n, avgLikes: 120000n, avgComments: 6000n, growthPercent: 2.5 },
    { clubId: 9n, followers: 22000000n, engagementRate: 4.1, reach: 11000000n, avgLikes: 110000n, avgComments: 5500n, growthPercent: 2.3 },
    { clubId: 10n, followers: 500000n, engagementRate: 6.5, reach: 300000n, avgLikes: 8000n, avgComments: 600n, growthPercent: 12.0 },
    { clubId: 11n, followers: 1200000n, engagementRate: 5.8, reach: 700000n, avgLikes: 15000n, avgComments: 1200n, growthPercent: 9.5 },
    { clubId: 12n, followers: 200000n, engagementRate: 2.8, reach: 100000n, avgLikes: 2000n, avgComments: 150n, growthPercent: 1.0 },
    { clubId: 13n, followers: 3000000n, engagementRate: 7.2, reach: 2000000n, avgLikes: 50000n, avgComments: 8000n, growthPercent: 15.0 },
    { clubId: 14n, followers: 5000000n, engagementRate: 8.5, reach: 3500000n, avgLikes: 80000n, avgComments: 12000n, growthPercent: 25.0 },
    { clubId: 15n, followers: 350000n, engagementRate: 3.0, reach: 180000n, avgLikes: 3000n, avgComments: 200n, growthPercent: 1.8 },
    { clubId: 16n, followers: 120000n, engagementRate: 4.5, reach: 60000n, avgLikes: 1500n, avgComments: 120n, growthPercent: 5.0 },
    { clubId: 17n, followers: 80000n, engagementRate: 3.8, reach: 40000n, avgLikes: 900n, avgComments: 80n, growthPercent: 2.2 },
    { clubId: 18n, followers: 250000n, engagementRate: 3.3, reach: 130000n, avgLikes: 2500n, avgComments: 180n, growthPercent: 1.5 },
    { clubId: 19n, followers: 1500000n, engagementRate: 3.6, reach: 800000n, avgLikes: 12000n, avgComments: 900n, growthPercent: 2.0 },
    { clubId: 20n, followers: 60000n, engagementRate: 4.0, reach: 30000n, avgLikes: 700n, avgComments: 60n, growthPercent: 3.0 },
  ];

  for (const m of metricsData) {
    ctx.db.clubMetrics.insert({
      id: 0n,
      clubId: m.clubId,
      followers: m.followers,
      engagementRate: m.engagementRate,
      reach: m.reach,
      avgLikes: m.avgLikes,
      avgComments: m.avgComments,
      growthPercent: m.growthPercent,
      lastUpdated: new Date().toISOString(),
    });
  }

  console.info(`Seed completado: ${clubs.length} clubes y ${metricsData.length} métricas insertadas`);
});
