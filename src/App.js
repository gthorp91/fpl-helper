import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, gridColumnLookupSelector, gridTabIndexColumnHeaderSelector } from '@mui/x-data-grid';
import SoccerLineUp from 'react-soccer-lineup'

import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';

function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [teams, setTeams] = useState(null);
  const [players, setPlayers] = useState(null);
  const [events, setEvents] = useState(null);
  const [dreamteam, setDreamteam] = useState(null);

  const [playerSearch, setPlayerSearch] = useState('');
  const [position, setPosition] = useState([]);
  const [teamName, setTeamName] = useState([]);
  const [priceValue, setPriceValue] = useState([0, 20]);
  const [formValue, setFormValue] = useState([-5, 30]);
  const [seasonValue, setSeasonValue] = useState([-5, 30]);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState([]);

  const [selectedTeamCost, setSelectedTeamCost] = useState(0);
  const [selectedTeamCount, setSelectedTeamCount] = useState(0);

  const handlePlayerSearchChange = (event) => {
    const { target: { value }, } = event;
    setPlayerSearch(value);
  };
  const handlePositionChange = (event) => {
    const { target: { value }, } = event;
    setPosition(typeof value === 'string' ? value.split(',') : value,);
  };
  const handleTeamChange = (event) => {
    const { target: { value }, } = event;
    setTeamName(typeof value === 'string' ? value.split(',') : value,);
  };
  function valuePriceFormatter(value) {
    return `${value} M`;
  }
  const handlePriceChange = (event, newValue) => {
    setPriceValue(newValue);
  };
  const handleFormChange = (event, newValue) => {
    setFormValue(newValue);
  };
  const handleSeasonValueChange = (event, newValue) => {
    setSeasonValue(newValue);
  };
  const handleRowClick = (params) => {
    console.log(params);
    setSelectedPlayer(params.row);
  };

  const drawerWidth = 200;

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));
  
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  
  const [openSelected, setOpenSelected] = React.useState(false);
  const handleClickOpenSelected = () => {
    setOpenSelected(true);
  };
  const handleCloseSelected = () => {
    setOpenSelected(false);
  };
  var teamNames = []
  const positions = [{ id: 1, position: 'GK' }, { id: 2, position: 'DF' }, { id: 3, position: 'MF' }, { id: 4, position: 'FW' }]
  var priceRange = { min: 0, max: 0 }
  var formRange = { min: 0.0, max: 0.0 }
  var seasonRange = { min: 0.0, max: 0.0 }
  var mostCaptained = []
  var mostSelected = []
  var topPerformer = []

  useEffect(() => {
    //fetch('data.json', { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
    fetch('https://fantasy.premierleague.com/api/bootstrap-static/')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setTeams(data.teams);
        setPlayers(data.elements);
        setEvents(data.events);
        setDreamteam(data.elements.filter(player => player.in_dreamteam));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function listCounter(list) {
    let counts = {}
    list.forEach((e) => {
      if (counts[e] === undefined) {
        counts[e] = 0
      }
      counts[e] += 1
    })
    return counts;
  }

  function setupFilters(teams, events, players) {
    teams.forEach((team) => {
      teamNames.push({ code: team.code, name: team.name })
    })

    let mc = []
    let ms = []
    let tp = []
    events.forEach((event) => {
      mc.push(event.most_captained);
      ms.push(event.most_selected);
      tp.push(event.top_element);
    })
    let captainCount = listCounter(mc);
    let selectedCount = listCounter(ms);
    let performerCount = listCounter(tp);

    players.forEach((player) => {
      // PRICE
      if (player.now_cost > priceRange.max) {
        priceRange.max = player.now_cost;
      }
      if (player.now_cost < priceRange.min || priceRange.min === 0) {
        priceRange.min = player.now_cost
      }

      // FORM
      if (Number(player.form) > formRange.max) {
        formRange.max = Number(player.form)
      }
      if (Number(player.form) < formRange.min || formRange.min === 0) {
        formRange.min = Number(player.form)
      }

      // VALUE
      if (Number(player.value_season) > seasonRange.max) {
        seasonRange.max = Number(player.value_season)
      }
      if (Number(player.value_season) < seasonRange.min || seasonRange.min === 0) {
        seasonRange.min = Number(player.value_season)
      }

      // CAPTAINED
      if (captainCount[player.id] !== undefined) {
        let newValue = { id: player.id, name: player.web_name, count: captainCount[player.id] };
        mostCaptained.push(newValue);
      }

      // SELECTED
      if (selectedCount[player.id] !== undefined) {
        let newValue = { id: player.id, name: player.web_name, count: selectedCount[player.id] };
        mostSelected.push(newValue);
      }

      // TOP PERFORMER
      if (performerCount[player.id] !== undefined) {
        let newValue = { id: player.id, name: player.web_name, count: performerCount[player.id] };
        topPerformer.push(newValue);
      }
    })
    
    priceRange.min = parseFloat((priceRange.min / 10).toFixed(1));
    priceRange.max = parseFloat((priceRange.max / 10).toFixed(1));
  }

  
  // Players have 3 'name' fields to try and display, the safest way to do this is to combine
  // the first and second names, and display the 'shirt' name in another column
  function getFullName(params) {
    return `${params.row.first_name || ''} ${params.row.second_name || ''}`;
  };


  // The 'now_cost' value that is saved is an int, so 12.4 would be stored as 124.
  // We need to convert this to the actual price shown in FPL.
  function getPriceFromCostInt(params) {
    return (params.row.now_cost / 10).toFixed(1);
  }


  // As the player information only provide the team code
  // We need to use that to find the team name to display.
  function getTeamName(params) {
    let result = teams.find((team) => {
      return team.code === params.row.team_code;
    })
    return result.name;
  }

  // As the position information is held as an enum
  // We need to use that to find the correct position 
  function getPositionName(params) {
    let result = positions.find((pos) => {
      return pos.id === params.row.element_type;
    })
    return result.position;
  }

  function applyFilters(){
    let filteredPlayers = data.elements;
    // Player name
    if (playerSearch !== null && playerSearch !== ''){
      filteredPlayers = filteredPlayers.filter(player => 
        player.web_name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(playerSearch.toLowerCase()) || 
        player.first_name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(playerSearch.toLowerCase()) ||
        player.second_name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(playerSearch.toLowerCase()));
    }
    // Team
    if (teamName.length > 0){
      let teamCodes = teamNames.filter(team => teamName.includes(team.name));
      filteredPlayers = filteredPlayers.filter((fp) => {
        return teamCodes.some((tc) => {
          return tc.code === fp.team_code;
        });
      });
    }
    // Position
    if (position.length > 0){
      let pos = positions.filter(pos => position.includes(pos.position));
      filteredPlayers = filteredPlayers.filter((fp) => {
        return pos.some((p) => {
          return p.id === fp.element_type;
        });
      });
    }
    // Price
    if (priceValue[0] > priceRange.min || priceValue[1] < priceRange.max){
      filteredPlayers = filteredPlayers.filter(player => 
        parseFloat((player.now_cost / 10).toFixed(1)) >= priceValue[0] &&
        parseFloat((player.now_cost / 10).toFixed(1)) <= priceValue[1]
      );
    }
    // Form
    if (formValue[0] > formRange.min || formValue[1] < formRange.max){
      filteredPlayers = filteredPlayers.filter(player => 
        player.form >= formValue[0] &&
        player.form <= formValue[1]
      );
    }
    // Season Value
    if (seasonValue[0] > seasonRange.min || seasonValue[1] < seasonRange.max){
      filteredPlayers = filteredPlayers.filter(player => 
        player.value_season >= seasonValue[0] &&
        player.value_season <= seasonValue[1]
      );
    }

    setPlayers(filteredPlayers);
  }

  function clearFilters(){
    setPlayerSearch('');
    setPosition([]);
    setTeamName([]);
    setPriceValue([0, 20]);
    setFormValue([-5, 30]);
    setSeasonValue([-5, 30]);
    setPlayers(data.elements);
  }

    // the positions are set up with an id that corresponds with the 'element_type' field for players.
  // 1 = Goalkeeper, 2 = Defender, 3 = Midfielder, 4 = Forward
  function setupTeam(team) {
    let goalkeeper = team.find(player => player.element_type === 1);
    let gk = buildPlayerList(goalkeeper);

    let defenders = team.filter(player => player.element_type === 2);
    let df = buildPlayerList(defenders);

    let midfielders = team.filter(player => player.element_type === 3);
    let cm = buildPlayerList(midfielders);

    let forwards = team.filter(player => player.element_type === 4);
    let fw = buildPlayerList(forwards);

    let squad = { "squad": { gk, df, cm, fw } };
    return squad; 
  }

  function buildPlayerList(players) {
    if (typeof players !== 'undefined') {
      console.log(players)
      if (players.length > 1) {
        let result = []
        players.forEach(player => result.push({ "name": player.web_name + " (" + (player.now_cost / 10).toFixed(1) + "M)", "number": parseInt(player.form), "color": "#87CEEB", "numberColor": "#333", "nameColor": "#333" }));
        return result;
      }
      else {
        return { "name": players.web_name + " (" + (players.now_cost / 10).toFixed(1) + "M)", "number": parseInt(players.form), "color": "#87CEEB", "numberColor": "#333", "nameColor": "#333" };
      }
    }
    else{
      return []
    }
  }

  function addRemovePlayer() {
    let player = selectedPlayer;
    let playerIndex = selectedTeam.indexOf(player);
    if (playerIndex >= 0){
      selectedTeam.splice(playerIndex,1);
      console.log('Player removed from team.');
    }
    else{
      selectedTeam.push(player);
      // No more than 3 players from each team
      // Warn/Highlight if over 100m is spent
      // No more than 2 GK, 5 DF, 5 MF, 3 FW in a single team
      // Warn how many players/positions are needed to complete team
      let teamCounter = [];
      let costCounter = 0;
      let positionCounter = [];
      selectedTeam.forEach(p => {
        teamCounter.push(p.team);
        if (teamCounter.filter(t => t === p.team).length > 3){
          alert('Too many players selected from ' + p.teamName);
          selectedTeam.splice(selectedTeam.indexOf(player),1);
        }
        costCounter += parseFloat((p.now_cost / 10).toFixed(1));
        if (costCounter >= 100){
          alert('Team cost is over £100m, current team selection costs: £' + costCounter);
        }
        positionCounter.push(p.element_type); 
        if (p.element_type === 1 && positionCounter.filter(pos => pos === p.element_type).length > 2){
          alert('Max number of GK\'s selected');
          selectedTeam.splice(selectedTeam.indexOf(player),1);
        }
        else if (p.element_type === 2 && positionCounter.filter(pos => pos === p.element_type).length > 5){
          alert('Max number of DF\'s selected');
          selectedTeam.splice(selectedTeam.indexOf(player),1);
        }
        else if (p.element_type === 3 && positionCounter.filter(pos => pos === p.element_type).length > 5){
          alert('Max number of MF\'s selected');
          selectedTeam.splice(selectedTeam.indexOf(player),1);
        }
        else if (p.element_type === 4 && positionCounter.filter(pos => pos === p.element_type).length > 3){
          alert('Max number of FW\'s selected');
          selectedTeam.splice(selectedTeam.indexOf(player),1);
        }
      })

      setSelectedTeamCost(costCounter);
      setSelectedTeamCount(selectedTeam.length)

    }
  }

  function CustomFooter() {
    return (
      <Box sx={{ p: 1, 
        display: 'flex',  
        justifyContent: 'space-evenly'}}>
        <Box sx={{ p: 1, 
        bgcolor: (selectedTeamCost >= 100 ? '#FF450080' : 'white'),
        border: '1px solid',
        borderColor: 'lightgrey',
        borderRadius: 2}}>Total Cost: £{selectedTeamCost}m</Box>
        <Box sx={{ p: 1, 
        border: '1px solid',
        borderColor: 'lightgrey',
        borderRadius: 2}}>Total Players Selected: {selectedTeamCount}/15</Box>
      </Box>
    );
  }

  // This is what is displayed in the application.
  return (
    <div className="App">
      {loading}
      {data &&
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar
            position="fixed"
            sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
          >
          </AppBar>
          <Drawer
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                p: 1
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                Filters
              </Typography>
            </Toolbar>
            <Divider />
            <List>
              {setupFilters(teams, events, players)}
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Typography id="input-slider" gutterBottom>
                  Player search
                </Typography>
                <TextField
                  id="outlined-basic" 
                  variant="outlined"
                  value={playerSearch}
                  onChange={handlePlayerSearchChange} />
              </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Typography id="input-slider" gutterBottom>
                  Position
                </Typography>
                <Select
                  value={position}
                  onChange={handlePositionChange}
                  input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {positions.map((position) => (
                    <MenuItem
                      key={position.id}
                      value={position.position}
                    >
                      {position.position}
                    </MenuItem>
                  ))}
                </Select>
                </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Typography id="input-slider" gutterBottom>
                  Teams
                </Typography>
                <Select
                  multiple
                  value={teamName}
                  onChange={handleTeamChange}
                  input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {teamNames.map((team) => (
                    <MenuItem
                      key={team.code}
                      value={team.name}
                    >
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
                </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Typography id="input-slider" gutterBottom>
                  Price
                </Typography>
                <Slider
                  getAriaLabel={() => 'Price range'}
                  value={priceValue}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  getAriaValueText={valuePriceFormatter}
                  min={priceRange.min}
                  max={priceRange.max}
                  step={0.1}
                  marks={[{value: priceRange.min, label: priceRange.min}, {value: priceRange.max, label: priceRange.max}]}
                />
              </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Typography id="input-slider" gutterBottom>
                  Form
                </Typography>
                <Slider
                  getAriaLabel={() => 'Form range'}
                  value={formValue}
                  onChange={handleFormChange}
                  valueLabelDisplay="auto"
                  min={formRange.min}
                  max={formRange.max}
                  step={0.1}
                  marks={[{value: formRange.min, label: formRange.min}, {value: formRange.max, label: formRange.max}]}
                />
              </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Typography id="input-slider" gutterBottom>
                  Season Value
                </Typography>
                <Slider
                  getAriaLabel={() => 'Season Value range'}
                  value={seasonValue}
                  onChange={handleSeasonValueChange}
                  valueLabelDisplay="auto"
                  min={seasonRange.min}
                  max={seasonRange.max}
                  step={0.1}
                  marks={[{value: seasonRange.min, label: seasonRange.min}, {value: seasonRange.max, label: seasonRange.max}]}
                />
              </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Divider sx={{ p: 1 }} />
                <Button variant="contained"
                  onClick={() => {
                    applyFilters();
                  }}>Apply Filters</Button>
              </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Button variant="contained"
                  onClick={() => {
                    clearFilters();
                  }}>Clear Filters</Button>
              </FormControl>
              <FormControl  sx={{ m: 0.4, width: '150px' }}>
              <Divider sx={{ p: 1 }} />  
                <Button variant="contained" onClick={handleClickOpen}>
                  View Dream Team
                </Button>
                <BootstrapDialog
                  onClose={handleClose}
                  aria-labelledby="customized-dialog-title"
                  open={open}
                >
                  <SoccerLineUp
                    size={ "small" }
                    color={ "#66FF00" }
                    pattern={ "lines" }
                    homeTeam={setupTeam(dreamteam)}
                  />
                  <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                      Exit
                    </Button>
                  </DialogActions>
                </BootstrapDialog>
              </FormControl>
              <FormControl sx={{ m: 0.4, width: '150px' }}>
                <Button variant="contained"
                  onClick={() => {
                    addRemovePlayer();
                  }}>Add/Remove Player</Button>
              </FormControl>
              <FormControl  sx={{ m: 0.4, width: '150px' }}>
                <Button variant="contained" onClick={handleClickOpenSelected}>
                  View Selected Team
                </Button>
                <BootstrapDialog
                  onClose={handleCloseSelected}
                  aria-labelledby="customized-dialog-title"
                  open={openSelected}
                >
                <Box sx={{ display: 'flex' }}>
                  <DataGrid
                    disableColumnMenu
                    sx={{ m: 0.4, height: '80vh', width: '8000px'}}
                    rows={selectedTeam}
                    columns={[
                      { field: 'first_name' },
                      { field: 'second_name' },
                      { field: 'full_name', headerName: 'Full Name', valueGetter: getFullName, flex: 2 },
                      { field: 'web_name', headerName: 'Name', flex: 2, renderCell: (params) => (
                        <div>
                          <Typography>{params.row.web_name}</Typography>
                          <Typography variant="caption">{params.row.first_name || ''} {params.row.second_name || ''}</Typography>
                        </div>
                      ) },
                      { field: 'element_type', headerName: 'Position', valueGetter: getPositionName, flex: 1 },
                      { field: 'team_code', headerName: 'Team Name', valueGetter: getTeamName, flex: 1 },
                      { field: 'now_cost', headerName: 'Cost', type: 'number', valueGetter: getPriceFromCostInt, flex: 1 },
                      { field: 'form', headerName: 'Form', type: 'number', flex: 1 },

                      { field: 'goals_scored', headerName: 'Goals', type: 'number', flex: 1 },
                      { field: 'assists', headerName: 'Assists', type: 'number', flex: 1 },
                      { field: 'clean_sheets', headerName: 'Clean Sheets', type: 'number', flex: 1 },
                    ]}
                    columnVisibilityModel={{
                      full_name: false,
                      first_name: false,
                      second_name: false
                    }}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: 'element_type'}],
                      },
                    }}
                    components={{
                      Footer: CustomFooter
                    }}
                  />
                </Box>
                  <DialogActions>
                    <Button autoFocus onClick={handleCloseSelected}>
                      Exit
                    </Button>
                  </DialogActions>
                </BootstrapDialog>
              </FormControl>
            </List>
          </Drawer>
          <DataGrid
            disableColumnMenu
            onRowClick={handleRowClick}
            sx={{ m: 0.4, 
              height: '99vh',
              '& .selected': {
                backgroundColor: '#d2ffb991',
                color: '#5b5b5b',
              }}}
            rows={players}
            columns={[
              { field: 'first_name' },
              { field: 'second_name' },
              { field: 'full_name', headerName: 'Full Name', valueGetter: getFullName, flex: 1 },
              { field: 'web_name', headerName: 'Name', flex: 1, renderCell: (params) => (
                <div>
                  <Typography>{params.row.web_name}</Typography>
                  <Typography variant="caption">{params.row.first_name || ''} {params.row.second_name || ''}</Typography>
                </div>
              ) },
              { field: 'element_type', headerName: 'Position', valueGetter: getPositionName, flex: 0.5 },
              { field: 'team_code', headerName: 'Team', valueGetter: getTeamName, flex: 0.5 },
              { field: 'now_cost', headerName: 'Cost', type: 'number', valueGetter: getPriceFromCostInt, flex: 0.5 },
              { field: 'form', headerName: 'Form', type: 'number', flex: 0.5 },
              { field: 'value_form', headerName: 'Value Form', type: 'number', flex: 0.5 },
              { field: 'value_season', headerName: 'Value Season', type: 'number', flex: 0.5 },
              { field: 'points_per_game', headerName: 'Points Per Game', type: 'number', flex: 0.5 },

              { field: 'goals_scored', headerName: 'Goals', type: 'number', flex: 0.5 },
              { field: 'assists', headerName: 'Assists', type: 'number', flex: 0.5 },
              { field: 'clean_sheets', headerName: 'Clean Sheets', type: 'number', flex: 0.5 },

              //{ field: 'chance_of_playing_next_round', headerName: '% Chance of Playing Next', type: 'number', flex: 0.5 },
              // Above field removed due to inconsistencies of the data - some had the 100% value expected, others were blank/null
              { field: 'transfers_in_event', headerName: 'Transfers In', type: 'number', flex: 0.5 },
              { field: 'transfers_out_event', headerName: 'Transfers Out', type: 'number', flex: 0.5 },
              { field: 'selected_by_percent', headerName: '% Selected', type: 'number', flex: 0.5 },
              { field: 'dreamteam_count', headerName: 'No Times in Dreamteam', type: 'number', flex: 0.5 },
              // These ranks are the overall rank across all positions,
              // need to work with the data to display it per position instead for it to be useful.
              {field: 'influence_rank', headerName: 'Influence Rank', type: 'number', flex:0.5},    
              {field: 'creativity_rank', headerName: 'Creativity Rank', type: 'number', flex:0.5},    
              {field: 'threat_rank', headerName: 'Threat Rank', type: 'number', flex:0.5},    
              {field: 'ict_index_rank', headerName: 'ICT Rank', type: 'number', flex:0.5}
            ]}
            columnVisibilityModel={{
              full_name: false,
              first_name: false,
              second_name: false
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'form', sort: 'desc' }],
              },
            }}
            getCellClassName={(params) => {
              if (selectedTeam.indexOf(params.row) >= 0) {
                return 'selected';
              }
            }}
          />
        </Box>
      }

    </div>
  );

}



export default App;

