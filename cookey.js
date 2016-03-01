// ==UserScript==
// @name		Cookie Information
// @namespace   Myrrhion
// @description cookiclicker addon script
// @include	 http://orteil.dashnet.org/cookieclicker/
// @version	 1
// @grant	   none
// ==/UserScript==

/** Helper functions */

//asking myself, why didn't orteil do this?
//edit: just realised why, still gonna use a workaround
function ger_pop(title,description,detail,quick,pic) 
{
var description = description||'';
var quick = quick||3;
var detail = detail||false;
var pic= pic||'';
if (Game.prefs.popups) 
{
	var text = title;
	if(detail)
		text = title+": "+description;
	Game.Popup(text);
}
else 
	Game.Notify(title,description,pic,quick);
}

function bold(text)
{
	return '<b>'+text+'</b>';
}

function g_cps(i)
{
	return (typeof(Game.Objects[i].cps)=='function'?Game.Objects[i].cps(Game.Objects[i]):Game.Objects[i].cps);
}

function to_time(cookies)
{
var temp = cookies/(Game.cookiesPs*(1-Game.cpsSucked));
str =" ";
if(temp/3600 >=1)
	str+=parseInt(temp/3600)+" h ";
if(((temp/60)%60)>=1 || str!=" ")
str += parseInt((temp/60)%60)+ " m " ;
if(parseInt(temp)%60 > 0 || str!=" ")
str += parseInt(temp)%60 + " s ";
if(str==" ")
str+="now";
return str;
}

function get_time(cookies)
{
	return cookies/(Game.cookiesPs*(1-Game.cpsSucked));
}
var cookieshow = 0;
var timeshow = 0;
var safety_on =0;

function toggle_cookies()
{
cookieshow = 1-cookieshow;
}
function toggle_time()
{
timeshow = 1-timeshow;
}
function toggle_cookies()
{
safety_on = 1-safety_on;
var str = ''
if(safety_on>0) ger_pop('Safety ON','You really should think again, safety sucks',false,3,[10,14]);
else str = ger_pop('Safety OFF','A wise decision',false,3,[10,14]);
}

var auto = null;

/** Buying logic */

function one_grandma_synergy(name)
{
	return Game.cookiesPsByType[name]/Game.getGrandmaSynergyUpgradeMultiplier(name)*0.01*(1/(Game.Objects[name].id-1));
}

/** The Main attraction: Best building function
*	Unlike many other scripts, the whole logic is stored in this subscript.
*	It doesn't add a building to check what would increase CpS the most, but uses a moderately complex formula to calculate efficiency.
*	It calculates, for which building the point where it has paid for itself, is closest to the present 
*/
function best_building(affordable)
{
	var affordable=affordable||0; //Feature requested by [REDACTED]
	var lowest = Number.MAX_VALUE;
	var name = "";
	var add=0;
	if (Game.Has('Thousand fingers')) add+=		0.1;
	if (Game.Has('Million fingers')) add+=		0.5;
	if (Game.Has('Billion fingers')) add+=		5;
	if (Game.Has('Trillion fingers')) add+=		50;
	if (Game.Has('Quadrillion fingers')) add+=	500;
	if (Game.Has('Quintillion fingers')) add+=	5000;
	if (Game.Has('Sextillion fingers')) add+=	50000;
	if (Game.Has('Septillion fingers')) add+=	500000;
	if (Game.Has('Octillion fingers')) add+=	5000000;
	var num =0;
	for (var i in Game.Objects) {if (Game.Objects[i].name!='Grandma') num+=Game.Objects[i].amount;}


	for (var me in Game.Objects) //goes through the arbitrary list
	{
		//Step 1: Calculate how much long it would take until we have enough cookies to buy it (Thanks to the JGU Physics department)
		var current= Math.max(get_time(-Game.cookies+Game.Objects[me].price),0);

		//Step 2: calculate the increase in CpS this building would bring
		//Step 2.1: Flat CpS this building would add
		cps = g_cps(me);

		//Step 2.2: Calculate the base multiplier for grandmas
		if (me.name == "Grandma" || me.name == "Portal") 
		{
			var mult=1;
			if (Game.Has('Farmer grandmas')) mult*=2;
			if (Game.Has('Worker grandmas')) mult*=2;
			if (Game.Has('Miner grandmas')) mult*=2;
			if (Game.Has('Cosmic grandmas')) mult*=2;
			if (Game.Has('Transmuted grandmas')) mult*=2;
			if (Game.Has('Altered grandmas')) mult*=2;
			if (Game.Has('Grandmas\' grandmas')) mult*=2;
			if (Game.Has('Antigrandmas')) mult*=2;
			if (Game.Has('Rainbow grandmas')) mult*=2;
			if (Game.Has('Banker grandmas')) mult*=2;
			if (Game.Has('Priestess grandmas')) mult*=2;
			if (Game.Has('Witch grandmas')) mult*=2;
			if (Game.Has('Bingo center/Research facility')) mult*=4;
			if (Game.Has('Ritual rolling pins')) mult*=2;
			if (Game.Has('Naughty list')) mult*=2;
			mult*=Game.GetTieredCpsMult(Game.Objects['Grandma']);
		}

		//Step 2.3: Grandmas affect every building with the proper upgrades
		if (me.name == "Grandma")
		{
			//Step 2.3.1: add the Grandma synergy boosts to our CpS
			if(Game.Has("Farmer grandmas"))
				cps += one_grandma_synergy("Farm");
			if(Game.Has("Miner grandmas"))
				cps += one_grandma_synergy("Mine");
			if(Game.Has("Worker grandmas"))
				cps += one_grandma_synergy("Factory");
			if(Game.Has("Banker grandmas"))
				cps += one_grandma_synergy("Bank");
			if(Game.Has("Priestess grandmas"))
				cps += one_grandma_synergy("Temple");
			if(Game.Has("Witch grandmas"))
				cps += one_grandma_synergy("Wizard tower");
			if(Game.Has("Cosmic grandmas"))
				cps += one_grandma_synergy("Shipment");
			if(Game.Has("Transmuted grandmas"))
				cps += one_grandma_synergy("Alchemy lab");
			if(Game.Has("Altered grandmas"))
				cps += one_grandma_synergy("Portal");
			if(Game.Has("Grandmas\' grandmas"))
				cps += one_grandma_synergy("Time machine");
			if(Game.Has("Antigrandmas"))
				cps += one_grandma_synergy("Antimatter condenser");
			if(Game.Has("Rainbow grandmas"))
				cps += one_grandma_synergy("Prism");

			//Step 2.3.2: Grandmas affect each other, so add the boost the other grandmas would gain
			//+2 because of the boost the new grandma will give to the others and because of the bosst it will receive from the others
			if (Game.Has('One mind'))
				cps+=(Game.Objects['Grandma'].amount+2)*0.02*mult; 
			if (Game.Has('Communal brainsweep')) 
				cps+=(Game.Objects['Grandma'].amount+2)*0.02*mult;
		} 
		else if (Game.hasAura('Elder Battalion')) 		//Alt Step 2.3: Elder Battalion Aura, 
		{
			cps+=(Game.cookiesPsByType['Grandma']/(1+0.01*num))*0.01;
		}


		//Step 2.4: Add the boost to Grandmas a new Portal brings
		if (me.name == "Portal" && Game.Has('Elder Pact')) 
			cps+=Game.Objects['Grandma'].amount*0.05*mult;

		//Step 2.5: With the right upgrades, Cursors gain a boost every for other building
		if (me.name != "Cursor")
		{
			cps += add*Game.Objects['Cursor'].amount;
		}

		//Step 2.6: Synergies, finding the correct formula to get the right increase was not easy
		for (var i in me.synergies)
		{
			var syn=me.synergies[i];
			if (Game.Has(syn.name))
			{
				if (syn.buildingTie2.name==me.name) 
					cps+=(Game.cookiesPsByType[syn.buildingTie1.name]/(1+0.05*(syn.buildingTie2.amount)))*0.05;
				else if (syn.buildingTie1.name==me.name) 
					cps+=(Game.cookiesPsByType[syn.buildingTie2.name]/(1+0.001*(syn.buildingTie1.amount)))*0.001;
			}
		}

		

		//Step 3: Add the time until the boost pays for the current object to the time until we can buy it
		current += Game.Objects[me].price/cps;
		
		//Step 4: is the current building the most efficient in terms of time till 0 is reached
		//Extra Step: if you call the function with a true, you will buy the most efficient building you can afford to buy right now
		if( current < lowest && (!affordable || Game.cookies>Game.Objects[me].price))
		{
			lowest = current;
			name = me;
		}
		
	}
	return name;
}

//The actual funtion that buys automatically
function auto_buy()
{
	//get most efficient building
	name = best_building();
	//how many cookies are still needed to buy it
	var needed = -Game.cookies+(Game.cookiesPs*12000*safety_on)+Game.Objects[name].price;
	
	if(needed>0) 
	{
		//if you still need to wait, call this function again when you're expected to have enough
		auto = setTimeout(function(){auto_buy()}, get_time(needed)*1000);
	}
	else
	{
		/*
		if you have enough
			1) buy the building 
			2) recalculate CpS (important to counter lag when mass buying)
			3) call this function again
		*/
		Game.buyMode=1;
		Game.Objects[name].buy(1);
		Game.CalculateGains();
		auto_buy();
	}
}



function minimum(){	
	var minimum = Number.MAX_VALUE;
	var w_max = -1;
		for(var i in Game.wrinklers)
		{
		var me = Game.wrinklers[i];
			if(me.phase==2)
			{
				if(me.sucked<minimum)
				{
					minimum=me.sucked;
					w_max=i;
				}
			}
		}
return minimum;}

var safety_text= "<br>But seriously, safety is completely inefficient, trust me";
document.addEventListener('keydown',function(event) {
	
	if (event.keyCode==78)//N (next to buy)
	{
		name = best_building();
		var needed = -Game.cookies+(Game.cookiesPs*12000*safety_on)+Game.Objects[name].price;
		ger_pop("Should buy "+bold(name)+" next","In "+to_time(needed)+(safety_on==1?safety_text:""),true,3,Game.GetIcon(name,1));
	}
	
	

	if (event.keyCode==66)//B (buy next best )
	{
		name = best_building(); 
		var needed = -Game.cookies+(Game.cookiesPs*12000*safety_on)+Game.Objects[name].price;
		if(needed>0)
			ger_pop("Can't buy "+bold(name),"until "+to_time(needed)+(safety_on==1?safety_text:""), true,3,Game.GetIcon(name,1));
		else 
		{
			Game.buyMode=1;
			Game.Objects[name].buy(1);
			ger_pop("Bought "+bold(name),'',false,3,Game.GetIcon(name,1));
		}
	}
	
	if (event.keyCode==79)//O (optimum cookies)
	{
		ger_pop("Optimum Cookies in bank: "+Beautify(Game.cookiesPs*60*15)); 
		//shows the perfect amount of cookies in bank to get the maximum if you get Lucky ;^)
	}
	if (event.keyCode==80)//P pop the fattest wrinkler
	{
	var max = 0;
	var w_max = -1;
		for(var i in Game.wrinklers)
		{
		var me = Game.wrinklers[i];
			if(me.phase==2)
			{
				if(me.sucked>max)
				{
					max=me.sucked;
					w_max=i;
				}
			}
		}
		if(w_max ==-1){
			ger_pop("0 wrinklers ready");
			return 0;}
			Game.wrinklers[w_max].hp=0;
	}
	if (event.keyCode==83) //S (safe buying)
	{
		toggle_cookies();
	}
	if(event.keyCode==84) //T (Activates the main feature of the script: the autobuy)
	{
	if(auto == null){
		ger_pop("Auto Buy ON");
		auto_buy();
		}
	else{
		clearTimeout(auto);
		auto = null;
		ger_pop("Auto Buy OFF");
	}
	}

	if (event.keyCode==86)//V (buy next best )
	{
		name = best_building(true);
		if(!name) 
		{
			ger_pop('You are Poor');
			return;
		}
		var needed = -Game.cookies+(Game.cookiesPs*12000*safety_on)+Game.Objects[name].price;
		if(needed>0)
			ger_pop("Can't buy "+bold(name),"until "+to_time(needed)+'<br>I suggest not using this function in the future'+(safety_on==1?safety_text:""), true,3,Game.GetIcon(name,1));
		else 
		{
			Game.buyMode=1;
			Game.Objects[name].buy(1);
			ger_pop("Bought "+bold(name),'I suggest not using this function in the future',false,3,Game.GetIcon(name,1));
		}

	}

	if (event.keyCode==87)//W (displays Wrinkler Stats)
	{
	var sum = 0;
	var n = 0;
	var shiny = false;
		for(var i in Game.wrinklers)
		{
		var me = Game.wrinklers[i];
			if(me.phase==2)
			{
					sucked=me.sucked
					var toSuck=1.1;
					if (Game.Has('Sacrilegious corruption')) toSuck*=1.05;
					if (me.type==1) {toSuck*=3; shiny=true;}
					if (Game.Has('Wrinklerspawn')) toSuck*=1.05;
					sucked*=toSuck;
					sum+=sucked;
					n++;
			}
		}
	ger_pop(n+' Wrinklers Containing '+bold(Beautify(sum))+' cookies','Sucking: '+bold(Beautify(Game.cookiesPs*Game.cpsSucked))+' CpS'+(shiny?'<br>including at least 1 shiny':''),true,4,[19,8]);
	}

	});

var numberFormatters_German =//german number convention goes -illion -illiarden
[
	rawFormatter,
	formatEveryThirdPower([
		'',
		' million',
		' milliarden',
		' billion',
		' billiarden',
		' trillion',
		' trilliarden',
		' quadrillion',
		' quadrilliarden',
		' quintillionen',
		' quintilliarden'
	]),
	formatEveryThirdPower([
		'',
		' M',
		' Mrd',
		' B',
		' Brd',
		' T',
		' Trd',
		' Qa',
		' Qard',
		' Qi',
		' Qird'
	])
];
Game.Win('Third-party');
Game.RefreshStore();
