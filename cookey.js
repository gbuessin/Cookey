// ==UserScript==
// @name        Cookie Information
// @namespace   cookiclicker
// @description cookiclicker addon script
// @include     http://orteil.dashnet.org/cookieclicker/
// @version     1
// @grant       none
// ==/UserScript==
function ger_pop(text)
{
if (Game.prefs.popups) Game.Popup(text);
		else Game.Notify(text,'','',2);
}
function g_cps(i)
{
	return Game.Objects[i].cps(Game.Objects[i]);
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
str+="now ";
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
if(safety_on>0) str = 'Safety on';
else str = 'Safety off';
ger_pop(str);
}
var auto = null;
function auto_buy()
    {
        var lowest = Number.MAX_VALUE;
        var name = "";
        for (var i in Game.Objects)
        {
            var current= Math.max(get_time(-Game.cookies+Game.Objects[i].price),0) + Game.Objects[i].price/g_cps(i);
            //var current =(Game.Objects[i].cps())/Game.Objects[i].price;
            if( current < lowest){
                lowest = current;
                name = i;
                }
            
        }
    var lucky = Game.cookies-Game.cookiesPs*12000-Game.Objects[name].price;
    if(lucky<0 && safety_on>0) 
    {
        ger_pop("shouldn't buy "+name+" until "+to_time(-lucky));
        auto = setTimeout(function(){auto_buy()},get_time(-lucky)*1000);
        return;
    }
    if(name == "") {ger_pop("you are poor");return;}
    var count = Game.Objects[name].amount;
    Game.Objects[name].buy();
    if(Game.Objects[name].amount == count) 
    {
    //ger_pop("Can't buy "+name+" until "+to_time(-(lucky+Game.cookiesPs*12000)));
    auto = setTimeout(function(){auto_buy()}, get_time(-(lucky+Game.cookiesPs*12000))*1000);
    }
    else auto_buy();
    }
    
    
document.addEventListener('keydown',function(event) {
    
    if (event.keyCode==65)//A (auto)
    {
    var pres = Game.HowMuchPrestige(Game.cookiesEarned+Game.cookiesReset);
    var temp = ((pres+2)*(pres+1)/2 *1e12 - (Game.cookiesEarned+Game.cookiesReset));
    ger_pop(to_time(temp)+"until you have "+(pres+1)+" prestige");
    }
    if (event.keyCode==78)//N (next to buy)
    {
       var lowest = Number.MAX_VALUE;
        var name = " ";
        for (var i in Game.Objects)
        {
            var current= Math.max(get_time(-Game.cookies+Game.Objects[i].price),0) + Game.Objects[i].price/g_cps(i);
            //var current =(Game.Objects[i].cps())/Game.Objects[i].price;
            if( current < lowest){
                lowest = current;
                name = i;
                }
            
        }
    ger_pop("Should buy next: "+name+" "+to_time(Math.max(-Game.cookies+Game.Objects[name].price,0)));
    }
    
    
    if (event.keyCode==86)//B (buy next best )
    {
        var highest = 0;
        var name = "";
        for (var i in Game.Objects)
        {
            var current =(g_cps(i))/Game.Objects[i].price;
            if( current > highest){
                if(Game.Objects[i].price>Game.cookies) continue;
                highest= current;
                name = i;
                }
            
        }
    var lucky = Game.cookies-Game.cookiesPs*12000-Game.Objects[name].price;
    if(lucky<0 && safety_on>0) 
    {
        ger_pop("shouldn't buy "+name+" until "+to_time(-lucky));
        return;
    }
    if(name == "") {ger_pop("you are poor");return;}
    var count = Game.Objects[name].amount;
    Game.Objects[name].buy();
    if(Game.Objects[name].amount == count) ger_pop("Can't buy "+name);
    else ger_pop("Bought "+name);
    }
    if (event.keyCode==66)//B (buy next best )
    {
        var lowest = Number.MAX_VALUE;
        var name = " ";
        for (var i in Game.Objects)
        {
            var current= Math.max(get_time(-Game.cookies+Game.Objects[i].price),0) + Game.Objects[i].price/g_cps(i);
            //var current =(Game.Objects[i].cps())/Game.Objects[i].price;
            if( current < lowest){
                lowest = current;
                name = i;
                }
            
        }
    var lucky = Game.cookies-Game.cookiesPs*12000-Game.Objects[name].price;
    if(lucky<0 && safety_on>0) 
    {
        ger_pop("shouldn't buy "+name+" for "+to_time(-lucky));
        return;
    }
    var count = Game.Objects[name].amount;
    Game.Objects[name].buy();
    if(Game.Objects[name].amount == count) ger_pop("Can't buy "+name+" until "+to_time(-(lucky+Game.cookiesPs*12000)));
    else ger_pop("Bought "+name);
    }
    
    
    if (event.keyCode==79)//O (optimum cookies)
    {
        ger_pop("Optimum Cookies in bank: "+Beautify(Game.cookiesPs*12000)); //shows the perfect amount of cookies in bank to get the maximum if you get Lucky ;^)
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
            ger_pop("nope");
            return 0;}
            Game.wrinklers[w_max].hp=0;
    }
    if (event.keyCode==83) //S (safe buying)
    {
        toggle_cookies()
    }
    if(event.keyCode==84)
    {
    if(auto == null){
        ger_pop("auto on");
        auto_buy();
        }
    else{
        clearTimeout(auto);
        auto = null;
        ger_pop("auto off");
    }
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
