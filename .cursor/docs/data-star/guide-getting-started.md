[Guide](https://data-star.dev/guide)
[Reference](https://data-star.dev/reference)
[How Tos](https://data-star.dev/how_tos)
[Examples](https://data-star.dev/examples)

More

[GOING DEEPER](https://data-star.dev/guide/going_deeper)

Getting Started
===============

Datastar brings the functionality provided by libraries like [Alpine.js](https://alpinejs.dev/)
 (frontend reactivity) and [htmx](https://htmx.org/)
 (backend reactivity) together, into one cohesive solution. It’s a lightweight, extensible framework that allows you to:

1.  Manage state and build reactivity into your frontend using HTML attributes.
2.  Modify the DOM and state by sending events from your backend.

With Datastar, you can build any UI that a full-stack framework like React, Vue.js or Svelte can, but with a much simpler, hypermedia-driven approach.

We're so confident that Datastar can be used as a JavaScript framework replacement that we challenge anyone to find a use-case for a web app that Datastar _cannot_ be used to build!

Installation[#](https://data-star.dev/guide/getting_started#installation)

--------------------------------------------------------------------------

The quickest way to use Datastar is to include it in your HTML using a script tag hosted on a CDN.

    <script type="module" src="https://cdn.jsdelivr.net/gh/starfederation/datastar@v1.0.0-beta.11/bundles/datastar.js"></script>
    

If you prefer to host the file yourself, download your own bundle using the [bundler](https://data-star.dev/bundler)
, then include it from the appropriate path.

    <script type="module" src="/path/to/datastar.js"></script>
    

You can alternatively install Datastar via [npm](https://www.npmjs.com/package/@starfederation/datastar)
. We don’t recommend this for most use-cases, as it requires a build step, but it can be useful for legacy frontend projects.

    npm install @starfederation/datastar
    

Data Attributes[#](https://data-star.dev/guide/getting_started#data-attributes)

--------------------------------------------------------------------------------

At the core of Datastar are [`data-*`](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes)
 attributes (hence the name). They allow you to add reactivity to your frontend in a declarative way, and to interact with your backend.

Datastar uses signals to manage state. You can think of signals as reactive variables that automatically track and propagate changes in expressions. They can be created and modified using data attributes on the frontend, or events sent from the backend. Don’t worry if this sounds complicated; it will become clearer as we look at some examples.

The Datastar [VSCode extension](https://marketplace.visualstudio.com/items?itemName=starfederation.datastar-vscode)
 and [IntelliJ plugin](https://plugins.jetbrains.com/plugin/26072-datastar-support)
 provided autocompletion for all `data-*` attributes.

### `data-bind`[#](https://data-star.dev/guide/getting_started#data-bind)

Datastar provides us with a way to set up two-way data binding on an element using the [`data-bind`](https://data-star.dev/reference/attribute_plugins#data-bind)
 attribute, which can be placed on any HTML element on which data can be input or choices selected from (`input`, `textarea`, `select`, `checkbox` and `radio` elements, as well as web components).

    <input data-bind-input />
    

This creates a new signal that can be called using `$input`, and binds it to the element’s value. If either is changed, the other automatically updates.

An alternative syntax, in which the value is used as the signal name, is also available. This can be useful depending on the templating language you are using.

    <input data-bind="input" />
    

### `data-text`[#](https://data-star.dev/guide/getting_started#data-text)

To see this in action, we can use the [`data-text`](https://data-star.dev/reference/attribute_plugins#data-text)
 attribute.

    <input data-bind-input />
    <div data-text="$input">
      I will be replaced with the contents of the input signal
    </div>
    

Input:

Output:

This sets the text content of an element to the value of the signal `$input`. The `$` prefix is required to denote a signal.

Note that `data-*` attributes are evaluated in the order they appear in the DOM, so the `data-text` attribute must come _after_ the `data-bind` attribute. See the [attribute plugins reference](https://data-star.dev/reference/attribute_plugins)
 for more information.

The value of the `data-text` attribute is a [Datastar expression](https://data-star.dev/guide/datastar_expressions)
 that is evaluated, meaning that we can use JavaScript in it.

    <input data-bind-input />
    <div data-text="$input.toUpperCase()">
      Will be replaced with the uppercase contents of the input signal
    </div>
    

Input:

Output:

### `data-computed`[#](https://data-star.dev/guide/getting_started#data-computed)

The [`data-computed`](https://data-star.dev/reference/attribute_plugins#data-computed)
 attribute creates a new signal that is computed based on a reactive expression. The computed signal is read-only, and its value is automatically updated when any signals in the expression are updated.

    <input data-bind-input />
    <div data-computed-repeated="$input.repeat(2)">
        <div data-text="$repeated">
            Will be replaced with the contents of the repeated signal
        </div>
    </div>
    

This results in the `$repeated` signal’s value always being equal to the value of the `$input` signal repeated twice. Computed signals are useful for memoizing expressions containing other signals.

Input:

Output:

### `data-show`[#](https://data-star.dev/guide/getting_started#data-show)

The [`data-show`](https://data-star.dev/reference/attribute_plugins#data-show)
 attribute can be used to show or hide an element based on whether an expression evaluates to `true` or `false`.

    <input data-bind-input />
    <button data-show="$input != ''">Save</button>
    

This results in the button being visible only when the input is _not_ an empty string (this could also be written as `!input`).

Input:

Output:

Save

### `data-class`[#](https://data-star.dev/guide/getting_started#data-class)

The [`data-class`](https://data-star.dev/reference/attribute_plugins#data-class)
 attribute allows us to add or remove a class to or from an element based on an expression.

    <input data-bind-input />
    <button data-class-hidden="$input == ''">Save</button>
    

If the expression evaluates to `true`, the `hidden` class is added to the element; otherwise, it is removed.

Input:

Output:

Save

The `data-class` attribute can also be used to add or remove multiple classes from an element using a set of key-value pairs, where the keys represent class names and the values represent expressions.

    <button data-class="{hidden: $input == '', 'font-bold': $input == 1}">Save</button>
    

### `data-attr`[#](https://data-star.dev/guide/getting_started#data-attr)

The [`data-attr`](https://data-star.dev/reference/attribute_plugins#data-attr)
 attribute can be used to bind the value of any HTML attribute to an expression.

    <input data-bind-input />
    <button data-attr-disabled="$input == ''">Save</button>
    

This results in a `disabled` attribute being given the value `true` whenever the input is an empty string.

Input:

Output:

Save

The `data-attr` attribute can also be used to set the values of multiple attributes on an element using a set of key-value pairs, where the keys represent attribute names and the values represent expressions.

    <button data-attr="{disabled: $input == '', title: $input}">Save</button>
    

### `data-signals`[#](https://data-star.dev/guide/getting_started#data-signals)

So far, we’ve created signals on the fly using `data-bind` and `data-computed`. All signals are merged into a global set of signals that are accessible from anywhere in the DOM.

We can also create signals using the [`data-signals`](https://data-star.dev/reference/attribute_plugins#data-signals)
 attribute.

    <div data-signals-input="1"></div>
    

Using `data-signals` _merges_ one or more signals into the existing signals. Values defined later in the DOM tree override those defined earlier.

Signals can be namespaced using dot-notation.

    <div data-signals-form.input="2"></div>
    

The `data-signals` attribute can also be used to merge multiple signals using a set of key-value pairs, where the keys represent signal names and the values represent expressions.

    <div data-signals="{input: 1, form: {input: 2}}"></div>
    

### `data-on`[#](https://data-star.dev/guide/getting_started#data-on)

The [`data-on`](https://data-star.dev/reference/attribute_plugins#data-on)
 attribute can be used to attach an event listener to an element and execute an expression whenever the event is triggered.

    <input data-bind-input />
    <button data-on-click="$input = ''">Reset</button>
    

This results in the `$input` signal’s value being set to an empty string whenever the button element is clicked. This can be used with any valid event name such as `data-on-keydown`, `data-on-mouseover`, etc.

Input:

Output:

Reset

So what else can we do now that we have declarative signals and expressions? Anything we want, really!

See if you can follow the code below based on what you’ve learned so far, _before_ trying the demo.

    <div
      data-signals="{response: '', answer: 'bread'}"
      data-computed-correct="$response.toLowerCase() == $answer"
    >
      <div id="question">What do you put in a toaster?</div>
      <button data-on-click="$response = prompt('Answer:') ?? ''">BUZZ</button>
      <div data-show="$response != ''">
        You answered “<span data-text="$response"></span>”.
        <span data-show="$correct">That is correct ✅</span>
        <span data-show="!$correct">
          The correct answer is “
          <span data-text="$answer"></span>
          ” 🤷
        </span>
      </div>
    </div>
    

What do you put in a toaster?

You answered “”. That is correct ✅ The correct answer is “” 🤷

BUZZ

We’ve just scratched the surface of frontend reactivity. Now let’s take a look at how we can bring the backend into play.

Backend Setup[#](https://data-star.dev/guide/getting_started#backend-setup)

----------------------------------------------------------------------------

Datastar uses [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events)
 (SSE) to stream zero or more events from the web server to the browser. There’s no special backend plumbing required to use SSE, just some syntax. Fortunately, SSE is straightforward and [provides us with some advantages](https://data-star.dev/essays/event_streams_all_the_way_down)
.

First, set up your backend in the language of your choice. Familiarize yourself with [sending SSE events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server)
, or use one of the backend [SDKs](https://data-star.dev/reference/sdks)
 to get up and running even faster. We’re going to use the SDKs in the examples below, which set the appropriate headers and format the events for us.

The following code would exist in a controller action endpoint in your backend.

    ;; Import the SDK's api and your adapter
    (require
      '[starfederation.datastar.clojure.api :as d*]
      '[starfederation.datastar.clojure.adapter.http-kit :refer [->sse-response on-open]])
    
    
    ;; in a ring handler
    (defn handler [request]
      ;; Create a SSE response
      (->sse-response request
       {on-open
        (fn [sse]
          ;; Merge html fragments into the DOM
          (d*/merge-fragment! sse
            "<div id="question">What do you put in a toaster?</div>")
    
          ;; Merge signals into the signals
          (d*/merge-signals! sse "{response: '', answer: 'bread'}"))}))
    

    using StarFederation.Datastar.DependencyInjection;
    
    // Adds Datastar as a service
    builder.Services.AddDatastar();
    
    app.MapGet("/", async (IDatastarServerSentEventService sse) =>
    {
        // Merges HTML fragments into the DOM.
        await sse.MergeFragmentsAsync(@"<div id=""question"">What do you put in a toaster?</div>");
    
        // Merges signals into the signals.
        await sse.MergeSignalsAsync("{response: '', answer: 'bread'}");
    });
    

    import (datastar "github.com/starfederation/datastar/sdk/go")
    
    // Creates a new `ServerSentEventGenerator` instance.
    sse := datastar.NewSSE(w,r)
    
    // Merges HTML fragments into the DOM.
    sse.MergeFragments(
        `<div id="question">What do you put in a toaster?</div>`
    )
    
    // Merges signals into the signals.
    sse.MergeSignals([]byte(`{response: '', answer: 'bread'}`))
    

    import ServerSentEventGenerator
    import ServerSentEventGenerator.Server.Snap -- or whatever is appropriate
    
    -- Merges HTML fragments into the DOM.
    send (withDefaults mergeFragments "<div id="question">What do you put in a toaster?</div>")
    
    -- Merges signals into the signals.
    send (withDefaults mergeSignals "{response: '', answer: 'bread'}")
    

    use starfederationdatastarServerSentEventGenerator;
    
    // Creates a new `ServerSentEventGenerator` instance.
    $sse = new ServerSentEventGenerator();
    
    // Merges HTML fragments into the DOM.
    $sse->mergeFragments(
        '<div id="question">What do you put in a toaster?</div>'
    );
    
    // Merges signals into the signals.
    $sse->mergeSignals(['response' => '', 'answer' => 'bread']);
    

    require 'datastar'
    
    # Create a Datastar::Dispatcher instance
    
    datastar = Datastar.new(request:, response:)
    
    # In a Rack handler, you can instantiate from the Rack env
    # datastar = Datastar.from_rack_env(env)
    
    # Start a streaming response
    datastar.stream do |sse|
      # Merges fragment into the DOM
      sse.merge_fragments %(<div id="question">What do you put in a toaster?</div>)
    
      # Merges signals
      sse.merge_signals(response: '', answer: 'bread')
    end
    

    use datastar::prelude::*;
    use async_stream::stream;
    
    Sse(stream! {
        // Merges HTML fragments into the DOM.
        yield MergeFragments::new("<div id='question'>What do you put in a toaster?</div>").into();
    
        // Merges signals into the signals.
        yield MergeSignals::new("{response: '', answer: 'bread'}").into();
    })

    // Creates a new `ServerSentEventGenerator` instance (this also sends required headers)
    ServerSentEventGenerator.stream(req, res, (stream) => {
          // Merges HTML fragments into the DOM.
         stream.mergeFragments(`<div id="question">What do you put in a toaster?</div>`);
    
         // Merges signals into the signals.
         stream.mergeSignals({'response':  '', 'answer': 'bread'});
    });

    const datastar = @import("datastar").httpz;
    
    // Creates a new `ServerSentEventGenerator`.
    var sse = try datastar.ServerSentEventGenerator.init(res);
    
    // Merges HTML fragments into the DOM.
    try sse.mergeFragments("<div id='question'>What do you put in a toaster?</div>", .{});
    
    // Merges signals into the signals.
    try sse.mergeSignals(.{ .response = "", .answer = "bread" }, .{});

The `mergeFragments()` method merges the provided HTML fragment into the DOM, replacing the element with `id="question"`. An element with the ID `question` must _already_ exist in the DOM.

The `mergeSignals()` method merges the `response` and `answer` signals into the frontend signals.

With our backend in place, we can now use the `data-on-click` attribute to trigger the [`@get()`](https://data-star.dev/reference/action_plugins#get)
 action, which sends a `GET` request to the `/actions/quiz` endpoint on the server when a button is clicked.

    <div
      data-signals="{response: '', answer: ''}"
      data-computed-correct="$response.toLowerCase() == $answer"
    >
      <div id="question"></div>
      <button data-on-click="@get('/actions/quiz')">Fetch a question</button>
      <button
        data-show="$answer != ''"
        data-on-click="$response = prompt('Answer:') ?? ''"
      >
        BUZZ
      </button>
      <div data-show="$response != ''">
        You answered “<span data-text="$response"></span>”.
        <span data-show="$correct">That is correct ✅</span>
        <span data-show="!$correct">
          The correct answer is “<span data-text="$answer"></span>” 🤷
        </span>
      </div>
    </div>
    

Now when the `Fetch a question` button is clicked, the server will respond with an event to modify the `question` element in the DOM and an event to modify the `response` and `answer` signals. We’re driving state from the backend!

You answered “”. That is correct ✅ The correct answer is “” 🤷

Fetch a question

BUZZ

### `data-indicator`[#](https://data-star.dev/guide/getting_started#data-indicator)

The [`data-indicator`](https://data-star.dev/reference/attribute_plugins#data-indicator)
 attribute sets the value of a signal to `true` while the request is in flight, otherwise `false`. We can use this signal to show a loading indicator, which may be desirable for slower responses.

    <div id="question"></div>
    <button
      data-on-click="@get('/actions/quiz')"
      data-indicator-fetching
    >
      Fetch a question
    </button>
    <div data-class-loading="$fetching" class="indicator"></div>
    

You answered “”. That is correct ✅ The correct answer is “” 🤷

Fetch a question

BUZZ

The `data-indicator` attribute can also be written with signal name in the attribute value.

    <button
      data-on-click="@get('/actions/quiz')"
      data-indicator="fetching"
    >
    

We’re not limited to just `GET` requests. Datastar provides [backend plugin actions](https://data-star.dev/reference/action_plugins#backend-plugins)
 for each of the methods available: `@get()`, `@post()`, `@put()`, `@patch()` and `@delete()`.

Here’s how we could send an answer to the server for processing, using a `POST` request.

    <button data-on-click="@post('/actions/quiz')">
      Submit answer
    </button>
    

One of the benefits of using SSE is that we can send multiple events (HTML fragments, signal updates, etc.) in a single response.

    (d*/merge-fragment! sse "<div id="question">...</div>")
    (d*/merge-fragment! sse "<div id="instructions">...</div>")
    (d*/merge-signals! sse "{answer: '...'}")
    (d*/merge-signals! sse "{prize: '...'}")
    

    sse.MergeFragmentsAsync(@"<div id=""question"">...</div>");
    sse.MergeFragmentsAsync(@"<div id=""instructions"">...</div>");
    sse.MergeSignalsAsync("{answer: '...'}");
    sse.MergeSignalsAsync("{prize: '...'}");
    

    sse.MergeFragments(`<div id="question">...</div>`)
    sse.MergeFragments(`<div id="instructions">...</div>`)
    sse.MergeSignals([]byte(`{answer: '...'}`))
    sse.MergeSignals([]byte(`{prize: '...'}`))
    

    import ServerSentEventGenerator
    import ServerSentEventGenerator.Server.Snap -- or whatever is appropriate
    
    send (withDefaults MergeFragments "<div id="question">...</div>")
    send (withDefaults MergeFragments "<div id="instructions">...</div>")
    send (withDefaults MergeFragments "{answer: '...'}")
    send (withDefaults MergeFragments "{prize: '...'}")
    
    

    $sse->mergeFragments('<div id="question">...</div>');
    $sse->mergeFragments('<div id="instructions">...</div>');
    $sse->mergeSignals(['answer' => '...']);
    $sse->mergeSignals(['prize' => '...']);
    

    datastar.stream do |sse|
      sse.merge_fragments('<div id="question">...</div>')
      sse.merge_fragments('<div id="instructions">...</div>')
      sse.merge_signals(answer: '...')
      sse.merge_signals(prize: '...')
    end
    

    yield MergeFragments::new("<div id='question'>...</div>").into()
    yield MergeFragments::new("<div id='instructions'>...</div>").into()
    yield MergeSignals::new("{answer: '...'}").into()
    yield MergeSignals::new("{prize: '...'}").into()
    

    stream.mergeFragments('<div id="question">...</div>');
    stream.mergeFragments('<div id="instructions">...</div>');
    stream.mergeSignals({'answer': '...'});
    stream.mergeSignals({'prize': '...'});
    

    try sse.mergeFragments("<div id='question'>...</div>"), .{};
    try sse.mergeFragments("<div id='instructions'>...</div>", .{});
    try sse.mergeSignals(.{ .answer = "..." }, .{});
    try sse.mergeSignals(.{ .prize = "..." }, .{});
    

Actions[#](https://data-star.dev/guide/getting_started#actions)

----------------------------------------------------------------

Actions in Datastar are helper functions that are available in `data-*` attributes and have the syntax `@actionName()`. We already saw the backend plugin actions above. Here are a few other useful actions.

### `@setAll()`[#](https://data-star.dev/guide/getting_started#setall)

The `@setAll()` action sets the value of all matching signals to the expression provided in the second argument. The first argument can be one or more space-separated paths in which `*` can be used as a wildcard.

    <button data-on-click="@setAll('foo.*', $bar)"></button>
    

This sets the values of all signals namespaced under the `foo` signal to the value of `$bar`. This can be useful for checking multiple checkbox fields in a form, for example:

    <input type="checkbox" data-bind-checkboxes.checkbox1 /> Checkbox 1
    <input type="checkbox" data-bind-checkboxes.checkbox2 /> Checkbox 2
    <input type="checkbox" data-bind-checkboxes.checkbox3 /> Checkbox 3
    <button data-on-click="@setAll('checkboxes.*', true)">Check All</button>
    

Checkbox 1 

Checkbox 2 

Checkbox 3 

Check All

### `@toggleAll()`[#](https://data-star.dev/guide/getting_started#toggleall)

The `@toggleAll()` action toggles the value of all matching signals. The first argument can be one or more space-separated paths in which `*` can be used as a wildcard.

    <button data-on-click="@toggleAll('foo.*')"></button>
    

This toggles the values of all signals namespaced under the `foo` signal (to either `true` or `false`). This can be useful for toggling multiple checkbox fields in a form, for example:

    <input type="checkbox" data-bind-checkboxes.checkbox1 /> Checkbox 1
    <input type="checkbox" data-bind-checkboxes.checkbox2 /> Checkbox 2
    <input type="checkbox" data-bind-checkboxes.checkbox3 /> Checkbox 3
    <button data-on-click="@toggleAll('checkboxes.*')">Toggle All</button>
    

Checkbox 1 

Checkbox 2 

Checkbox 3 

Toggle All

View the [reference overview](https://data-star.dev/reference/overview)
.

[GOING DEEPER](https://data-star.dev/guide/going_deeper)
