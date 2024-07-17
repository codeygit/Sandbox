
var array = ['INFO@WHIDBEYISLANDHERB.COM','Washington@Kaleafa.com','BERAKI2015@GMAIL.COM','probst_janet@yahoo.com','HENOK.ABRAHA@GMAIL.COM','DAVIDJAMESAHL@YAHOO.COM','PATWATERS55@GMAIL.COM','christian@lucidmj.com','manager@luckyleaf.co','dahlstrom.jill@gmail.com','MIKE@MARIJUANAMARTWA.COM','covingtonindoorgardens@yahoo.com','253MARYMART@GMAIL.COM','tim@bayshorecannabis.com','MALIKATWATER@YAHOO.COM','MRDOOBEES@GMAIL.COM','MUFFYSSMOKINGREENS@GMAIL.COM','EMANON@CRUZIO.COM','NEXTSTEPSJOSH@GMAIL.COM','JASMELSANGHA@GMAIL.COM','dianna@sacpa.us','STARTRECKIE@YAHOO.COM','NWCCCANYON@GMAIL.COM','OCEANGREENSRE@GMAIL.COM','olympiaweedco@gmail.com','daniel@farmerjudd.com','daniel@paperandleaf.com','MIKE@MDPCPA.COM','QUINN@SATORIMJ.COM','jmartin@prcwa.com','rmann@rainiercannabis.com','ashley@royalscannabis.com','fezzman@gmail.com','KBERRETH@BERRETHSMITH.COM','nicole@idealcannabis.net','MMILLS1954@COMCAST.NET','WENDYB.RNR@GMAIL.COM','INFO@SWEETJANENW.COM','SWEETLEAFABERDEEN@GMAIL.COM','Ciaran.wilburn@gmail.com','ADMIN@THEBAKEREESEATTLE.COM','ryan@firehousenw.com','accounting@thegalleryco.com','THEGREENSEED@HOTMAIL.COM','THEHAPPYCROPSHOPPE@GMAIL.COM','THEHAPPYCROPSHOPPE@GMAIL417295','LCKA4@COMCAST.NET','SARAELTINGE@THEHERBERYNW.COM','SMPREDER@GMAIL.COM','THEKUSHERY502@MAIL.COM','CHRIS@NOVEL-TREE.COM','ggreeley95@gmail.com','THEROOTCELLAR420@GMAIL.COM','JOE.B@THESTASHBOXLLC.COM','SHELLEY@FIREHOUSENW.COM','JOHNPCHILDS@HOTMAIL.COM','LAURA@THEVAULTCANNABIS.COM','markay1.mb@gmail.com','patti@treehouseclub.buzz','INFO@TROVECANNABIS.COM','JohnD@Ikes.com','RACHELLE@WCWENTERPRISES.COM;michael@wcwenterprises.com','TANGLETOWNHOLDINGS@GMAIL.COM','BOOKY66SS@YAHOO.COM','whiterabbitccrs@gmail.com','ALDEN@WORLDOFWEED.COM','SCOTTATKISON@MAC.COM','AAPESCHEK@COMCAST.NET','bd-jennings@hotmail.com']
var answer = (array) => { 
    let ar = [];
    for(let item of array){
        ar.push("'" + item.toLowerCase() + "'");
    }    
    return ar.join(', ');
}

console.log(answer(array));