# BioLog - Current State & Iteration Plan

**Last Updated:** January 2026  
**Status:** MVP Complete → Iteration Phase

---

## ✅ What's Built (Current State)

### Core Features
- ✅ **Voice Input** (`useVoiceInput` hook) - Web Speech API integration
- ✅ **AI Agent** (`/api/ask`) - Gemini 3 Flash with function calling
  - `save_symptom_log` - Logs symptoms with severity, tags, date
  - `query_logs` - Queries symptom history
  - `analyze_patterns` - Finds correlations and trends
- ✅ **MongoDB Integration** - Persistent storage via Atlas
- ✅ **Auth0** - Login/logout (per-user data not yet wired)
- ✅ **Home Heatmap** - GitHub-style 90-day visualization
- ✅ **Calendar Views** - Month/year calendar components
- ✅ **Chat Page** - Full conversation interface
- ✅ **Deployed to Vercel** - Live at `personal-health-log.vercel.app`

### UI Components
- ✅ Navbar
- ✅ Theme Toggle (light/dark)
- ✅ Voice button
- ✅ Response display
- ✅ Heatmap visualization

---

## 🎯 Current Gaps & Issues

### Critical Fixes Needed
1. **Auth0 per-user data** - All logs are shared. Need `userId` filtering
2. **Heatmap refresh** - Should auto-refresh after save (partially working)
3. **Date handling** - Ensure timezone consistency
4. **Error handling** - Better user feedback on API failures

### UX Improvements
1. **Home page layout** - Currently cramped, needs spacing
2. **Heatmap legend** - Make color scale clearer
3. **Loading states** - Show spinners during API calls
4. **Empty states** - "No logs yet" messaging

---

## 🚀 Iteration Ideas (Prioritized)

### Phase 1: Polish & Fix (Next 2-4 hours)
**Goal:** Make demo-ready

1. **Fix Auth0 per-user isolation**
   - Add `userId` to all log documents
   - Filter queries by `userId`
   - Test with multiple accounts

2. **Improve heatmap**
   - Add month labels
   - Better color scale (match severity levels)
   - Tooltip on hover showing date + details
   - Make it more compact if needed

3. **Home page polish**
   - Better spacing/layout
   - Move heatmap above or below input?
   - Add "Recent logs" section?

4. **Error handling**
   - Try/catch around all API calls
   - User-friendly error messages
   - Retry logic for failed requests

### Phase 2: Features (If time permits)
**Goal:** Add "wow" factor

1. **ElevenLabs Voice Response** (30 min)
   - AI speaks back after logging
   - "I've logged your headache. That's your third this week."
   - Wins MLH ElevenLabs prize

2. **Proactive Health Forecast** (1-2 hours)
   - Daily "Today's Risk" card
   - "Based on your patterns, you're 70% likely to have a migraine today"
   - Actionable recommendations

3. **Body Map Interface** (2-3 hours)
   - Tap body parts to log pain
   - Visual pain tracking
   - More intuitive than text

4. **Export for Doctor** (1 hour)
   - One-click PDF/JSON export
   - Clean summary format
   - "Share with doctor" button

### Phase 3: Advanced (Post-hackathon)
**Goal:** Real product features

1. **Predictive Analytics**
   - ML model for symptom prediction
   - Trigger identification
   - Trend forecasting

2. **Medication Tracking**
   - Link symptoms to medications
   - Effectiveness analysis
   - Reminders

3. **Condition-Specific Modes**
   - IBS mode (food tracking)
   - Migraine mode (weather, sleep)
   - CHF mode (fluid, weight)

4. **Social Features**
   - Share anonymized patterns
   - Community insights
   - Support groups

---

## 🎨 Design Iterations

### Current Issues
- Header is cluttered (Navbar + Auth buttons + Theme toggle)
- Heatmap might be too small or too large
- No clear visual hierarchy

### Proposed Changes
1. **Consolidate header** - Combine Navbar with Auth
2. **Heatmap placement** - Maybe sidebar or dedicated section?
3. **Color system** - Match severity levels consistently
4. **Typography** - Improve readability

---

## 🏆 Prize Track Alignment

### Current Eligibility
- ✅ **Health Hacks** - Core focus
- ✅ **Best AI Hack** - Gemini function calling
- ✅ **Best Use of Gemini** - MLH prize
- ✅ **Best Use of MongoDB** - MLH prize
- ✅ **Best Use of Vercel** - Deployed
- ✅ **Best Use of Auth0** - MLH prize (if per-user works)
- 🟡 **Best UI/UX** - Needs polish

### To Win
1. **Demo flow** - Smooth, no errors
2. **Story** - Clear problem → solution
3. **Differentiation** - What makes this unique?
4. **Polish** - Looks professional

---

## 📋 Demo Script (Draft)

1. **Problem** - "Tracking symptoms is hard. Forms are tedious. Data sits unused."
2. **Solution** - "BioLog: voice-first, AI-powered, visual tracking"
3. **Show** - Voice input → AI logs → Heatmap updates
4. **Insight** - "AI found your migraines correlate with poor sleep"
5. **Impact** - "This is what patients actually need"

---

## 🔧 Technical Debt

### Code Quality
- [ ] Add TypeScript (currently mixed JS/TS)
- [ ] Error boundaries
- [ ] Unit tests for critical paths
- [ ] API rate limiting

### Performance
- [ ] Optimize MongoDB queries (indexes)
- [ ] Cache heatmap data
- [ ] Lazy load calendar views

### Security
- [ ] Input sanitization
- [ ] Rate limiting on API routes
- [ ] Auth0 token validation

---

## 📝 Next Steps (This Session)

**Priority 1:**
1. Fix Auth0 per-user data (30 min)
2. Polish heatmap (15 min)
3. Test full demo flow (15 min)

**Priority 2:**
4. Add ElevenLabs (30 min)
5. Improve error handling (20 min)

**Priority 3:**
6. Deploy latest to Vercel
7. Prep demo script

---

## 💡 Crazy Ideas (Future)

- **Health Tamagotchi** - Cute companion that reacts to your health
- **Time Machine** - Scroll through health history visually
- **Anti-App** - Just a microphone, nothing else
- **Voice Companion** - AI that talks back (ElevenLabs)
- **Body Heat Map** - Tap where it hurts

---

**Questions to Answer:**
1. What's the ONE thing that makes this different?
2. Who is this for? (Chronic illness patients? General wellness?)
3. What's the core action? (Log → Visualize → Understand)
4. How do we make people come back daily?

---

*This is a living document. Update as you iterate.*
