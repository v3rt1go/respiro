Contact Form for PencilBlue
=====

#### Display a contact form on your PencilBlue site

Features
-----

* Ajax-Powered Contact Form
* Emailer Service
* Custom Object Service
* Captcha (sweetCaptcha)
* Configurable Admin Interface

Installation and Setup
-----

1. Clone the contactform-pencilblue repository into the plugins folder of your PencilBlue installation.
    ```shell
    cd [pencilblue_directory]/plugins
    git clone https://github.com/alexcurtis/contactform-pencilblue.git
    ```

2. Install the contactform-pencilblue plugin through the manage plugins screen in the admin section. (/admin/plugins)

3. Go to the contactform-pencilblue settings screen and setup the following options: (/admin/plugins/contactform-pencilblue/settings)

    * `Captcha Settings` - enable/disable and API credentials.
    * `Emailer Settings` - enable/disable, target inbox and email template path.
    * `Custom Object Settings` - enable/disable, type name and the option to create a new type.
    * `Plugin Settings` - stylesheet path and phone option.

    Note: All of these settings can be accessed from the handy `Contact Form` drop down in the main Admin navbar.


4. Add the `^tmp_contact_form^` directive to any HTML template and the contact form will now be automatically loaded.

5. If not already done so, make sure the PencilBlue email system is setup correctly. (/admin/site_settings/email)

The plugin install process will automatically write the default options to the database and create a custom object type called `contactform`. 


In Development
-----

* Customizable Fields (with validation).
* Fancier email template.


Feedback
-----

Please post any issues or feedback to the GitHub repo: https://github.com/alexcurtis/contactform-pencilblue
