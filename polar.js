/*****************************************************************
 * Initialize javascript session variable
 *****************************************************************/
//sessvars.$.clearMem();
if(typeof sessvars.initalPoll === 'undefined')
    sessvars.initalPoll = true;
if(typeof sessvars.notifyQueue === 'undefined')
    sessvars.notifyQueue = new Array();
if(typeof sessvars.messages === 'undefined'){
    sessvars.messages = {
        "new": 0,
        "list": []
    };
}
if(typeof sessvars.notifications === 'undefined'){
    sessvars.notifications = {
        "new": 0,
        "list": []
    };
}

/*****************************************************************
 * Poll the server, dawg
 *****************************************************************/
(function poll() {
    // Start polling if user logged in, else clear sessvars
	if(userId != 0){
		if(sessvars.initalPoll){
			$.ajax({
				url: "/notifications/poll",
				type: "POST",
				data: {"request": "initial"},
				success: function(response) {
					setNotifications(response.notifications);
					setMessages(response.messages);
					sessvars.initalPoll = false;
				},
				dataType: "json"
			});
		} else {
			updateMessageInterface();
			updateNotificationInterface();
		}
		setTimeout(function() {
			$.ajax({
				url: "/notifications/poll",
				type: "POST",
				success: function(response) {
					updateNotifications(response.notifications);
					updateMessages(response.messages);
				},
				dataType: "json",
				complete: poll,
				timeout: 2000
			})
		}, 5000);
	} else {
		sessvars.$.clearMem();
	}
}(jQuery));

/*****************************************************************
 * Methods for flashing messages on the user's window
 *****************************************************************/

/**
 * Flashes messages in notification boxes from the sessvars.flashQueue
 * at a specified interval.
 */
var flashOnInterval = setInterval(function(){processNotifyQueue()},2000);
function processNotifyQueue()
{
    var message =  sessvars.notifyQueue.pop();
    if(message){
        console.log(message);
        $('#Notification').jnotifyAddMessage({
            text: message
        });
    }
}

/**
 * Append message(s) to the notify queue
 *
 * @param messages string or array of strings
 */
function notify(messages)
{
    if (messages instanceof Array) {
        messages.forEach(function(message) {
            sessvars.notifyQueue.push(message);
        });
    } else {
        sessvars.notifyQueue.push(messages);
    }
    
}

/*****************************************************************
 * Methods for handling notifications
 *****************************************************************/

/**
 * Sets the inital 10 notifications in the notification menu & updates interface
 *
 * @param notifications array of notifications
 */
function setNotifications(notifications)
{
    sessvars.notifications.new = notifications.new;
    sessvars.notifications.list = notifications.list;
    updateNotificationInterface();
    if(notifications.new > 0)
        notify("You have " + notifications.new + " unseen notifications.");
}

/**
 * Updates the notification session variables & updates interface
 *
 * @param notifications array of notifications
 */
function updateNotifications(notifications)
{
    // Update notification js session variables
    sessvars.notifications.new = notifications.new;
    notifications.list.forEach(function(notification) {
        if(sessvars.notifications.list.length >=10)
            sessvars.notifications.list.pop();
        sessvars.notifications.list.push(notification);
    });
    // Update notification label/menu
    updateNotificationInterface();
    // Notify user of new notifications
    notifications.list.forEach(function(notification) {
        notify(notification.message);
    });
}

/**
 * Updates the notification menu label & menu using notification session vars
 */
function updateNotificationInterface()
{
    var notification_menu = $('#notification-menu');

	// Add to menu
	notification_menu.html('<li class="notification-msg divider"></li>');
    if(sessvars.notifications.list.length == 0)
        notification_menu.prepend('<li class = "notification-msg">No notifications</li>');
    else
        sessvars.notifications.list.forEach(function(notification) {
            notification_menu.prepend('<li class = "notification-msg">'+notification.message+'</li>');
        });
	notification_menu.append('<li><a href = "/notifications/default/index">View All</a></li>');
    if(sessvars.notifications.new > 0)
        $('#notification-label').html("<i class=\"ss-icon ss-standard\">bell</i> (" + sessvars.notifications.new + ")");
    else
        $('#notification-label').html("<i class=\"ss-icon ss-standard\">bell</i>");
}

/*****************************************************************
 * Methods for handling inbox messages
 *****************************************************************/

/**
 * Sets the inital 10 messages in the message menu & updates interface
 *
 * @param messages array of messages
 */
function setMessages(messages)
{
    sessvars.messages = messages;
    updateMessageInterface();
    if(messages.new > 0)
        notify("You have " + messages.new + " unread messages.");
}

/**
 * Updates the message session variables & updates interface
 *
 * @param messages array of messages
 */
function updateMessages(messages)
{
    // Update message js session variables
    sessvars.messages.new = messages.new;
    messages.list.forEach(function(message) {
        if(sessvars.messages.list.length >=10)
            sessvars.messages.list.pop();
        sessvars.messages.list.push(message);
    });
    // Update message label/menu
    updateMessageInterface();
    // Notify user of new messages
    messages.list.forEach(function(message) {
        notify(message.from + " has sent you a message.");
    });
}

/**
 * Updates the message menu label & menu using message session vars
 */
function updateMessageInterface()
{
    var message_menu = $('#messages-menu');

	// Add to menu
	message_menu.html('<li class="message divider"></li>');
	if(sessvars.messages.list.length == 0)
        message_menu.prepend('<li class="message">None</li>');
    else
    {

        sessvars.messages.list.forEach(function(message) {
            message_menu.prepend('<li class="message">'+message.message+'</li>');
        });
    }
	message_menu.append('<li><a href = "/message/inbox">View All</a></li>');

	// Add # in label
    if(sessvars.messages.new > 0)
        $('#messages-label').html("<i class=\"ss-icon ss-standard\">mail</i> (" + sessvars.messages.new + ")");
    else
        $('#messages-label').html("<i class=\"ss-icon ss-standard\">mail</i>");

   /**
	*
	*
	*/
   function setDefaultNotifications()
   {	$.ajax({
		   url: '/notifications/default/listDefaultNotifications',
		   type: 'GET',
		   dataType: 'json',
		   success: function(response)
		   {	
			   alert("fck");
			   alert(response);
			   var notification_menu = $('#notification-menu');

			   if(response == "None")
				   notification_menu.prepend('<li class = "notification-msg">None</li>');
			   else
			   {	for(var i = response[0].length-1; i >= 0; i--)
				   {	notification_menu.children().last().prepend('<li id ="'+response[0][i]+'" class = "notification-msg">'+response[1][i]+'</li>');
					   if(response[2][i] == '1')
						   addNotificationAction(response[0][i]);
				   }
			   }
		   },
		   error: function(xhr)
		   {
			   alert("error");
		   }
	   });
	   return false;
   }
}
