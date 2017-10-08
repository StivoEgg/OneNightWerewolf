$(function () {
    var socket = io();

    var $window = $(window);
    var $usernameInput = $('#usernameInput'); // Input for username
    var $passcodeInput = $('#passcodeInput');
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
  
    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var username;
    var $currentInput = $usernameInput.focus();
    
    // login
    // Sets the client's username
    function login () {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            socket.emit('login', {
                'username' : username,
                'passcode' : $passcodeInput.val()
            });
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();
            
        }
    }
    
    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey) && username) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                // sendMessage();
                // socket.emit('stop typing');
                // typing = false;
                console.log('type')
            } else {
                login();
            }
        }
    });

    // Utils
    // Prevents input from having injected markup
    function cleanInput (input) {
        return $('<div/>').text(input).html();
    }
});